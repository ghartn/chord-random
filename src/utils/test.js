let tonalChord = require("tonal-chord");
let tonalNote = require("tonal-note");
let tonalDistance = require("tonal-distance");
let teoria = require("teoria");

const VOICING_THRESHOLD = 4;

const getChordNotes = progression => {
	let noteArray = [];
	for (let currentChord of progression) {
		let chordNotes = [];
		chordNotes = tonalChord.exists(currentChord)
			? tonalChord.notes(currentChord)
			: teoria
					.chord(currentChord)
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
		note = tonalNote.simplify(note);
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
				console.log(voicing, noteToTry);
				for (var j = 1; j < voicing.length; j++) {
					//iterate through already voiced notes (bass note)
					let noteVoiced = voicing[j];
					console.log(noteVoiced);
					let distance = Math.abs(
						tonalDistance.semitones(noteVoiced, noteToTry)
					);
					console.log(noteVoiced, noteToTry, distance, voicing);
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

console.log(getChordNotes(["Dm", "CMaj7", "F", "G"]));
