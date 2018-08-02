import React, { Component } from 'react';
import { Note } from "tonal";

class Piano extends Component {

	_generatePiano = (chord, octave) => {
		let keyPatten = [
			"w", "b", "w", "b", "w", "w", "b", "w", "b", "w", "b", "w"]
		let keys = [];
		let midi = 36 //C2;
		for (let i = 0; i < octave; i++) {
			for (let key of keyPatten) {
				keys.push(
					<li key={midi} className={`${key === "w" ? "white-key" : "black-key"} ${chord.includes(midi) ? "pressed" : ""} transition`} />
				)
				midi++;
			}
		}
		return (
			<ul className="hidden md:block piano list-reset w-full">
				{keys}
			</ul>
		)
	}

	render() {
		let chord = this.props.chord ? this.props.chord.map(note => Note.midi(note)) : [];
		let piano = this._generatePiano(chord, 3);
		return piano;
	}
}

export default Piano;