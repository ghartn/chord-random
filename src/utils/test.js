let tonalChord = require("tonal-chord");
let tonalNote = require("tonal-note");
let tonalDistance = require("tonal-distance");
let _ = require("lodash")
const VOICING_THRESHOLD = 2;

const getChordNotes = progression => {
	let noteArray = [];
	for (let currentChord of progression) {
		let chordNotes = [];
		chordNotes = tonalChord.notes(currentChord)
		let chordVoicing = voiceChord(chordNotes);
		noteArray.push(chordVoicing);
	}
	return noteArray;
};

const voiceChord = chordNotes => {
	if (!chordNotes) return [];
	let voicing = [];
	let rootNote = chordNotes[0];
	voicing.push(rootNote + "2");
	voicing.push(rootNote + "3");
	let harmonics = chordNotes.slice(1);
	let shuffled = _.shuffle(harmonics);
	let octave = 3;

	let notes = shuffled.map(note => {
		let simplified = tonalNote.simplify(note + octave);
		return tonalNote.midi(simplified)
	}).sort();

	let voiced = isVoiced(notes);

	while (!voiced) {
		//random?
		let index = Math.floor(Math.random() * notes.length)
		notes[index] += 12;
		voiced = isVoiced(notes.sort());
	}

	let voicedNotes = notes.map(note => tonalNote.fromMidi(note));

	return voicing.concat(voicedNotes);
};

const isVoiced = (notes) => {
	return notes.every((current, index) => {
		let pass = false;
		const previous = notes[index - 1];
		const next = notes[index + 1];
		if (previous && next) {
			let distancePrevious = Math.abs(previous - current);
			let distanceNext = Math.abs(next - current);
			pass = distancePrevious >= VOICING_THRESHOLD && distanceNext >= VOICING_THRESHOLD;
		}
		else if (previous) {
			let distancePrevious = Math.abs(previous - current);
			pass = distancePrevious >= VOICING_THRESHOLD;
		}
		else if (next) {
			let distanceNext = Math.abs(next - current);
			pass = distanceNext >= VOICING_THRESHOLD;
		}
		else {
			pass = true;
		}
		return pass;
	});
}


//TODO: check chord exists for every chord
function test() {
	let root = "C";
	let types = tonalChord.names();
	for (let type of types) {
		console.log(getChordNotes([root + type]))
	}
}

test()