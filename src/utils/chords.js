import { Chord, Scale, Distance, Note } from "tonal";
import ChordTypes from "./ChordTypes"
import shortid from "shortid";
import palette from "./palette";
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
			let newChord = generateChord(key, colors)
			progression.push(newChord);
			colors = colors.filter(color => color !== newChord.color)

		}
	}

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
	}
	else if (minorDegrees.includes(scaleIndex)) {
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
		notes: getChordNotes(scale[scaleIndex] + chordType),
		lock: false,
		playing: false,
		color: colors[colorIndex]
	};
};

export const mapProgressionToKey = (progression, oldKey, newKey) => {
	if (oldKey === newKey) return progression;

	let cleanedProgression = [];
	progression.forEach(chord => {
		let newChord = Object.assign({}, chord)
		let interval = Distance.interval(oldKey, newKey);
		newChord.root = Distance.transpose(chord.root, interval);
		newChord.name = newChord.root + newChord.type;
		newChord.notes = getChordNotes(newChord.root + newChord.type);
		cleanedProgression.push(newChord);
	});
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
			let currentMidi = Note.midi(current + octave), nextMidi = Note.midi(next + octave);
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

const isVoiced = notes => {
	return notes.every((current, index) => {
		let pass = false;
		const previous = notes[index - 1];
		const next = notes[index + 1];
		if (previous && next) {
			let distancePrevious = Math.abs(previous - current);
			let distanceNext = Math.abs(next - current);
			pass =
				distancePrevious >= VOICING_THRESHOLD &&
				distanceNext >= VOICING_THRESHOLD;
		} else if (previous) {
			let distancePrevious = Math.abs(previous - current);
			pass = distancePrevious >= VOICING_THRESHOLD;
		} else if (next) {
			let distanceNext = Math.abs(next - current);
			pass = distanceNext >= VOICING_THRESHOLD;
		} else {
			pass = true;
		}
		return pass;
	});
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

export const restoreProgression = (progression) => {
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
			notes: getChordNotes(chordName),
			lock: false,
			playing: false,
			color: color
		};
	})
	return newProgression;
}

export const getProgressionURL = (progression) => {
	let progressionURL = "";
	progression.forEach(chord => progressionURL += chord.name + "-");
	progressionURL = progressionURL.replace(/\#/g, "sh");
	return progressionURL.substring(0, progressionURL.length - 1);
}