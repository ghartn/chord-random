import { Chord, Scale, Distance, Note } from "tonal";
import ChordTypes from "./ChordTypes";
import shortid from "shortid";
import palette from "./palette";
import intersection from "lodash/intersection";
import pull from "lodash/pull";
import * as MidiWriter from "midi-writer-js";

const VOICING_THRESHOLD = 4;

export const generateProgression = (key, oldProgresion) => {
	let progression = [...oldProgresion];
	let colors = Object.keys(palette);

	//check for locked chords
	if (progression && progression.length > 0) {
		progression.forEach((chord, index) => {
			let newChord = chord;
			if (!chord.lock) {
				newChord = generateChord(key, colors);
			}
			progression[index] = newChord;
			colors = colors.filter(color => color !== newChord.color);
		});
	} else {
		for (let i = 0; i < 4; i++) {
			let newChord = generateChord(key, colors);
			progression.push(newChord);
			colors = colors.filter(color => color !== newChord.color);
		}
	}

	let voicedProgression = voiceProgression(
		progression.map(chord => chord.name)
	);
	progression.forEach((chord, i) => {
		if (!chord.notes) {
			chord.notes = voicedProgression[i];
		}
	});
	console.log(progression.map(chord => chord.name));
	return progression;
};

const generateChord = (key, colors) => {
	let scale = Scale.notes(key + " major");
	let scaleIndex = Math.floor(Math.random() * scale.length);
	let colorIndex = Math.floor(Math.random() * colors.length);

	const majorDegrees = [0, 3, 4];
	const minorDegrees = [1, 2, 5];
	let chordType = "";

	if (majorDegrees.includes(scaleIndex)) {
		let types = ChordTypes.filter(x => x.major);
		chordType = types[Math.floor(Math.random() * types.length)];
	} else if (minorDegrees.includes(scaleIndex)) {
		let types = ChordTypes.filter(x => x.minor);
		chordType = types[Math.floor(Math.random() * types.length)];
	} else {
		chordType = ChordTypes[Math.floor(Math.random() * ChordTypes.length)];
	}

	chordType = chordType ? chordType.name : "";

	return {
		id: shortid.generate(),
		root: scale[scaleIndex],
		type: chordType,
		name: scale[scaleIndex] + chordType,
		lock: false,
		playing: false,
		color: colors[colorIndex]
	};
};

export const mapProgressionToKey = (progression, oldKey, newKey) => {
	if (oldKey === newKey) return progression;

	let cleanedProgression = [];
	progression.forEach(chord => {
		let newChord = Object.assign({}, chord);
		let interval = Distance.interval(oldKey, newKey);
		newChord.root = Distance.transpose(chord.root, interval);
		newChord.name = newChord.root + newChord.type;
		cleanedProgression.push(newChord);
	});

	let voicedProgression = voiceProgression(
		cleanedProgression.map(chord => chord.name)
	);
	cleanedProgression.forEach((chord, i) => {
		chord.notes = voicedProgression[i];
	});
	console.log(progression);
	return cleanedProgression;
};

export const getChordNotes = chordName => {
	let chordNotes = [];
	chordNotes = Chord.notes(chordName);
	return voiceChord(chordNotes);
};

const voiceChord = chordNotes => {
	if (!chordNotes) return [];
	let voicing = [];

	//add root note in bass
	let rootNote = chordNotes[0];
	voicing.push(rootNote + "2");
	//slice so we don't voice twice
	let notes = chordNotes.slice(1);

	//start voicing in octave 3
	let octave = 3;
	notes.forEach((current, i) => {
		let next = notes[i + 1];
		if (next) {
			let currentMidi = Note.midi(current + octave),
				nextMidi = Note.midi(next + octave);
			if (nextMidi < currentMidi) {
				//we crossed an octave so increment
				octave++;
			}
		}
		let currentVoicing = String(Note.simplify(current)) + octave;
		voicing.push(currentVoicing);
	});
	return voicing;
};

const voiceProgression = progression => {
	let progressionNotes = [];
	let voicedProgression = [];
	for (let currentChord of progression) {
		progressionNotes.push(Chord.notes(currentChord));
		//set up voicing
		voicedProgression.push([]);
	}
	//ok first we add the bass note in octave 2, and top note in octave 5
	for (let i in progressionNotes) {
		let chordNotes = progressionNotes[i];
		let rootNote = String(Note.simplify(chordNotes[0]));
		let topNote = String(Note.simplify(chordNotes[chordNotes.length - 1]));
		voicedProgression[i].push(rootNote + "2");
		voicedProgression[i].push(topNote + "4");
	}

	//put notes that are common in the same octave
	let notesInCommon = intersection(...progressionNotes);
	if (notesInCommon.length > 0) {
		for (let note of notesInCommon) {
			//set a common voice for notes in common
			let noteVoice = String(Note.simplify(note)) + "3";
			for (let i in voicedProgression) {
				voicedProgression[i].push(noteVoice);
				pull(progressionNotes[i], note);
			}
		}
	}
	for (let i in progressionNotes) {
		//remove the bass note, and pull the common note from the chordNotes
		let chordNotes = progressionNotes[i];
		let rootNote = chordNotes[0];
		let topNote = chordNotes[chordNotes.length - 1];
		pull(progressionNotes[i], rootNote);
		pull(progressionNotes[i], topNote);
	}

	//ok, so common notes are voiced, now we voice everything else!
	//set up an iterative sliding window of size 3,2,1
	for (let windowSize = progression.length - 1; windowSize >= 1; windowSize--) {
		let windowIterations = progression.length - windowSize + 1;
		for (let i = 0; i < windowIterations; i++) {
			let progressionSlice = progressionNotes.slice(i, i + windowSize);
			let notesInCommon = intersection(...progressionSlice);
			if (notesInCommon.length > 0) {
				for (let note of notesInCommon) {
					let octave = Math.random() > 0.4 ? 4 : 3;
					let noteVoice = String(Note.simplify(note)) + octave;
					for (let chord of progressionSlice) {
						let index = progressionNotes.findIndex(x => x === chord);
						if (index !== -1) {
							voicedProgression[index].push(noteVoice);
							pull(progressionNotes[index], note);
						}
					}
				}
			}
		}
	}
	return voicedProgression;
};

export const generateMidi = progression => {
	var track = new MidiWriter.Track();
	let bpm = 120;

	track.setTempo(bpm);

	track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

	for (let chord of progression) {
		track.addEvent(
			new MidiWriter.NoteEvent({
				pitch: chord.notes,
				duration: "2"
			})
		);
	}
	// Generate a data URI
	var write = new MidiWriter.Writer([track]);
	//write.saveMIDI('generated-midi-' + new Date().toDateString());
	return write.dataUri();
};

export const restoreProgression = progression => {
	let colors = Object.keys(palette);

	let newProgression = progression.map(chord => {
		let chordName = chord.replace(/sh/g, "#");
		let chordTokens = Chord.tokenize(chordName);
		let colorIndex = Math.floor(Math.random() * colors.length);
		let color = colors[colorIndex];
		colors = colors.filter(x => x !== color);
		return {
			id: shortid.generate(),
			root: chordTokens[0],
			type: chordTokens[1],
			name: chordName,
			lock: false,
			playing: false,
			color: color
		};
	});

	let voicedProgression = voiceProgression(
		newProgression.map(chord => chord.name)
	);
	newProgression.forEach((chord, i) => {
		chord.notes = voicedProgression[i];
	});

	return newProgression;
};

export const getProgressionURL = progression => {
	let progressionURL = "";
	progression.forEach(chord => (progressionURL += chord.name + "-"));
	progressionURL = progressionURL.replace(/\#/g, "sh");
	return progressionURL.substring(0, progressionURL.length - 1);
};
