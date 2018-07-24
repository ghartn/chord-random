import { Chord, Scale, Distance, Note } from "tonal";
import COLORS from "./colors";
import teoria from "teoria";
import * as MidiWriter from "midi-writer-js";
const VOICING_THRESHOLD = 5;

export const generateProgression = (key, oldProgresion) => {
	let progression = [...oldProgresion];

	//check for locked chords
	if (progression && progression.length > 0) {
		progression.forEach((chord, index) => {
			if (chord.lock) {
				progression[index] = chord;
			} else {
				progression[index] = generateChord(key);
			}
		});
	} else {
		for (let i = 0; i < 4; i++) {
			progression.push(generateChord(key));
		}
	}

	return progression;
};

const generateChord = key => {
	let chords = Chord.names();
	let scale = Scale.notes(key + " major");
	let chordIndex = Math.floor(Math.random() * chords.length);
	let scaleIndex = Math.floor(Math.random() * scale.length);
	let colorIndex = Math.floor(Math.random() * COLORS.length);
	return {
		root: scale[scaleIndex],
		type: chords[chordIndex],
		name: scale[scaleIndex] + chords[chordIndex],
		lock: false,
		color: COLORS[colorIndex]
	};
};

export const mapProgressionToKey = (progression, oldKey, newKey) => {
	if (oldKey === newKey) return progression;

	let cleanedProgression = [];
	progression.forEach(chord => {
		let newChord = { ...chord };
		let interval = Distance.interval(oldKey, newKey);
		newChord.root = Distance.transpose(chord.root, interval);
		newChord.display = newChord.root + newChord.type;
		cleanedProgression.push(newChord);
	});
	return cleanedProgression;
};

export const getChordNotes = progression => {
	let noteArray = [];
	for (let currentChord of progression) {
		let chordNotes = [];
		chordNotes = Chord.exists(currentChord.display)
			? Chord.notes(currentChord.display)
			: teoria
					.chord(currentChord.display)
					.notes()
					.map(note =>
						note
							.name()
							.toString()
							.toUpperCase()
					);
		let chordVoicing = voiceChord(chordNotes);
		noteArray.push(chordVoicing);
	}
	return noteArray;
};

const voiceChord = chordNotes => {
	if (!chordNotes) return [];
	let voicing = [];
	for (var i in chordNotes) {
		//TODO: sometimes append 4 or 2? bass notes? better inversions
		let note = chordNotes[i];
		note = Note.simplify(note);
		if (i == 0) {
			//bass note, we will duplicate it in lower octave
			voicing.push(note + "2");
			voicing.push(note + "3");
		} else {
			//this algorithm is bad and makes no sense
			let voiced = false;
			let octave = 3;
			while (!voiced) {
				let noteToTry = note + octave;
				for (var j = 1; j < voicing.length; j++) {
					//iterate through already voiced notes (bass note)
					let noteVoiced = voicing[j];
					let distance = Math.abs(Distance.semitones(noteVoiced, noteToTry));
					if (distance < VOICING_THRESHOLD) {
						//note voice is too close to note already voiced
						break;
					} else {
						voiced = true;
						voicing.push(noteToTry);
						break;
					}
				}
				octave++; //increase octave
			}
		}
	}
	return voicing;
};

export const generateMidi = progression => {
	var track = new MidiWriter.Track();
	let bpm = 120;

	track.setTempo(bpm);

	track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

	for (let chord of progression) {
		track.addEvent(
			new MidiWriter.NoteEvent({
				pitch: chord,
				duration: "8"
			})
		);
	}
	// Generate a data URI
	var write = new MidiWriter.Writer([track]);
	//write.saveMIDI('generated-midi-' + new Date().toDateString());
	return write.dataUri();
};
