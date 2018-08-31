let tonalChord = require("tonal-chord");
let tonalNote = require("tonal-note");
let tonalScale = require("tonal-scale");
let _ = require("lodash");
const VOICING_THRESHOLD = 3;

const getChordNotes = progression => {
	let noteArray = [];
	for (let currentChord of progression) {
		let chordNotes = [];
		chordNotes = tonalChord.notes(currentChord);
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

	let notes = shuffled
		.map(note => {
			let simplified = tonalNote.simplify(note + octave);
			return tonalNote.midi(simplified);
		})
		.sort();

	let voiced = isVoiced(notes);

	while (!voiced) {
		//random?
		let index = Math.floor(Math.random() * notes.length);
		notes[index] += 12;
		voiced = isVoiced(notes.sort());
	}

	let voicedNotes = notes.map(note => tonalNote.fromMidi(note));

	return voicing.concat(voicedNotes);
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

const voiceProgression = progression => {
	let progressionNotes = [];
	let voicedProgression = [];
	for (let currentChord of progression) {
		progressionNotes.push(tonalChord.notes(currentChord));
		//set up voicing
		voicedProgression.push([]);
	}
	console.log(progressionNotes);
	console.log("------------------");
	//ok first we add the bass note in octave 2, and top note in octave 5
	for (let i in progressionNotes) {
		let chordNotes = progressionNotes[i];
		let rootNote = chordNotes[0];
		let topNote = chordNotes[chordNotes.length - 1];
		voicedProgression[i].push(rootNote + "2");
		voicedProgression[i].push(topNote + "4");
	}

	//put notes that are common in the same octave
	let notesInCommon = _.intersection(...progressionNotes);
	if (notesInCommon.length > 0) {
		for (let note of notesInCommon) {
			//set a common voice for notes in common
			let noteVoice = note + "4";
			for (let i in voicedProgression) {
				voicedProgression[i].push(noteVoice);
				_.pull(progressionNotes[i], note);
			}
		}
	}
	for (let i in progressionNotes) {
		//remove the bass note, and pull the common note from the chordNotes
		let chordNotes = progressionNotes[i];
		let rootNote = chordNotes[0];
		let topNote = chordNotes[chordNotes.length - 1];
		_.pull(progressionNotes[i], rootNote);
		_.pull(progressionNotes[i], topNote);
	}

	console.log(progressionNotes);
	console.log("------------------");
	//ok, so common notes are voiced, now we voice everything else!
	//set up an iterative sliding window of size 3,2,1
	for (let windowSize = progression.length - 1; windowSize >= 1; windowSize--) {
		let windowIterations = progression.length - windowSize + 1;
		for (let i = 0; i < windowIterations; i++) {
			let progressionSlice = progressionNotes.slice(i, i + windowSize);
			let notesInCommon = _.intersection(...progressionSlice);
			console.log(progressionSlice, notesInCommon);
			console.log("----");
			if (notesInCommon.length > 0) {
				for (let note of notesInCommon) {
					for (let chord of progressionSlice) {
						//TODO: use isVoiced to increment octave when bass notes are too close together!
						let octave = 3;
						let index = progressionNotes.findIndex(x => x === chord);
						if (index !== -1) {
							let noteVoice = note + octave;
							voicedProgression[index].push(noteVoice);
							let midiProgression = voicedProgression.map(note =>
								tonalNote.midi(tonalNote.simplify(note))
							);
							console.log(isVoiced(midiProgression));
							_.pull(progressionNotes[index], note);
						}
					}
				}
			}
		}
	}
	console.log("-----------------");
	return voicedProgression;
};

//TODO: check chord exists for every chord
function test() {
	let progression = ["Em11", "B9#11b13", "B9sus4", "G13#9"];

	console.log(voiceProgression(progression));
}

test();
