import React, { Component } from "react";
import { Note } from "tonal";
import Tone from "tone";

const MIN_OCTAVE = 2;
const MAX_OCTAVE = 7;
class Piano extends Component {
	constructor() {
		super();
		this.state = {
			octave: 3,
			playing: []
		};
	}
	componentDidMount() {
		this.polySynth = new Tone.PolySynth(10, Tone.Synth).toMaster();
		this.polySynth.set({
			"oscillator.type": "triangle",
			volume: -16,
			portamento: 0.1,
			envelope: {
				attack: 0.1,
				decay: 1.2,
				release: 1.0
			}
		});
		document.addEventListener("keypress", this._octaveHandler);
		document.addEventListener("keydown", e => this._onKeyPress(e, "attack"));
		document.addEventListener("keyup", e => this._onKeyPress(e, "release"));
	}

	componentWillUnmount() {
		if (this.polySynth) {
			this.polySynth.dispose();
		}
		document.addEventListener("keypress", this._octaveHandler);
		document.removeEventListener("keydown");
		document.removeEventListener("keyup");
	}

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
			let pressed = chord.includes(midi) || this.state.playing.includes(midi);
			return (
				<li
					key={midi}
					note={midi}
					className={`${key === "w" ? "white-key" : "black-key"} ${
						pressed ? "pressed" : ""
					} transition cursor-pointer`}
					onMouseDown={() => this._playNote(Note.fromMidi(midi), "attack")}
					onMouseUp={() => this._playNote(Note.fromMidi(midi), "release")}
					onMouseLeave={() => this._playNote(Note.fromMidi(midi), "release")}
				/>
			);
		});
		return (
			<ul
				className="hidden md:block piano list-reset w-full"
				onKeyPress={this._onKeyPress}
			>
				{keys}
			</ul>
		);
	};

	_playNoteFromMidi = midi => {
		this._playNote(Note.fromMidi(midi));
	};

	_playNote = (note, mode) => {
		let { playing } = { ...this.state };
		if (this.polySynth) {
			switch (mode) {
				case "attack":
					playing.push(Note.midi(note));
					this.polySynth.triggerAttack(note);
					break;
				case "release":
					playing = playing.filter(x => x !== Note.midi(note));
					this.polySynth.triggerRelease(note);
					break;
				default:
					break;
			}
		}
		this.setState({
			playing
		});
	};

	_octaveHandler = e => {
		let { key } = e;
		let { octave } = this.state;
		switch (key) {
			//octave handlers
			case "z":
				this._decrementOctave();
				break;
			case "x":
				this._incrementOctave();
				break;
		}
	};

	_onKeyPress = (e, mode) => {
		let { key, repeat } = e;
		let { octave } = this.state;
		let note;
		switch (key) {
			//C
			case "a":
				note = "C";
				break;
			//C#
			case "w":
				note = "C#";
				break;
			//D
			case "s":
				note = "D";
				break;
			//D#
			case "e":
				note = "D#";
				break;
			//E
			case "d":
				note = "E";
				break;
			//F
			case "f":
				note = "F";
				break;
			//F#
			case "t":
				note = "F#";
				break;
			//G
			case "g":
				note = "G";
				break;
			//G#
			case "y":
				note = "G#";
				break;
			//A
			case "h":
				note = "A";
				break;
			//A#
			case "u":
				note = "A#";
				break;
			//B
			case "j":
				note = "B";
				break;
			//C upper
			case "k":
				note = "C";
				octave++;
				break;
			//C# upper
			case "o":
				note = "C#";
				octave++;
				break;
			//D upper
			case "l":
				note = "D";
				octave++;
				break;
		}
		if (note && !repeat) {
			this._playNote(note + octave, mode);
		}
	};

	_decrementOctave = () => {
		let { octave } = this.state;
		let newOctave = octave > MIN_OCTAVE ? octave - 1 : octave;
		this.setState({
			octave: newOctave
		});
	};

	_incrementOctave = () => {
		let { octave } = this.state;
		let newOctave = octave < MAX_OCTAVE ? octave + 1 : octave;
		this.setState({
			octave: newOctave
		});
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
