import React, { Component } from "react";
import { Note } from "tonal";
import Tone from "tone";

class Piano extends Component {
	_generatePiano = (chord, octave) => {
		let keyPatten = [
			"w",
			"b",
			"w",
			"b",
			"w",
			"w",
			"b",
			"w",
			"b",
			"w",
			"b",
			"w"
		];
		let piano = [];
		for (let i = 0; i < octave; i++) {
			piano = piano.concat(keyPatten);
		}
		let firstNote = 36; //C2;
		let keys = piano.map((key, index) => {
			let midi = firstNote + index;
			return (
				<li
					key={midi}
					note={midi}
					className={`${key === "w" ? "white-key" : "black-key"} ${
						chord.includes(midi) ? "pressed" : ""
					} transition cursor-pointer`}
					onClick={() => this._playNote(midi)}
				/>
			);
		});
		return <ul className="hidden md:block piano list-reset w-full">{keys}</ul>;
	};

	_playNote = midi => {
		console.log(midi);
		console.log(Note.fromMidi(midi));
		let polySynth = new Tone.PolySynth(10, Tone.Synth).toMaster();
		polySynth.set({
			"oscillator.type": "triangle",
			volume: -16,
			portamento: 0.1,
			envelope: {
				attack: 0.1,
				decay: 1.2,
				sustain: 0,
				release: 0.8
			}
		});
		polySynth.triggerAttackRelease(Note.fromMidi(midi), "4n");
	};

	render() {
		let chord = this.props.chord
			? this.props.chord.map(note => Note.midi(note))
			: [];
		let piano = this._generatePiano(chord, 3);
		return piano;
	}
}

export default Piano;
