import React, { Component } from "react";
import {
	progressionToString,
	mapProgressionToKey,
	getChordNotes
} from "../utils/chords";
import keys from "../utils/keys";
import Tone from "tone";

class Progression extends Component {
	constructor() {
		super();
		this.state = {
			inKey: false,
			previousKey: "C",
			key: "C",
			bpm: 120,
			playing: false,
			chordPart: null,
			stopEvent: null
		};
	}

	_onKeyChange = e => {
		this.setState({
			previousKey: this.state.key,
			key: e.target.value
		});
	};

	_cleanup = () => {
		if (this.state.chordPart) {
			this.state.chordPart.dispose();
		}
		if (this.state.stopEvent) {
			this.state.stopEvent.dispose();
		}
		Tone.Master.mute = true;
		Tone.Transport.stop();
		Tone.Transport.cancel(0);
		this.setState({
			playing: false,
			chordPart: null,
			stopEvent: null
		});
		return;
	};

	_listen = () => {
		if (this.state.playing) {
			this._cleanup();
			return;
		}

		let key = this.state.key;
		let progessionInKey = mapProgressionToKey(
			this.props.progression,
			this.state.previousKey,
			this.state.key
		);
		let chordNotes = getChordNotes(progessionInKey);
		let polySynth = new Tone.PolySynth(6, Tone.Synth).toMaster();
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

		Tone.Master.mute = false;
		Tone.Transport.bpm.value = this.state.bpm;

		let chords = [];
		let endTime = "";
		for (let index in chordNotes) {
			let chord = chordNotes[index];
			let time = `${Number(index)}${Number(index) !== 0 ? "m" : ""}`;
			chords.push([time, chord]);
			endTime = `${Number(index) + 1}m`;
		}

		let chordPart = new Tone.Part((time, chord) => {
			polySynth.triggerAttackRelease(chord, "1m", time);
		}, chords).start(0);

		let stopEvent = new Tone.Event((time, x) => {
			this._cleanup();
		}).start(endTime);

		Tone.Transport.stop();
		Tone.Transport.start("+0.1");

		this.setState({
			playing: true,
			chordPart,
			stopEvent
		});
	};

	_renderProgression = progression => {
		let progressionDisplay = progression.map((chord, index) => {
			let root = chord.root;
			let type = chord.type.split("");
			return (
				<span key={index} className="flex-1 mr-4 tracking-wide">
					<span className={`text-3xl text-${this.props.color}`}>{root}</span>
					<span className="text-grey-dark text-lg">
						{type.map((value, index) => {
							//if 'flat' symbol
							if (value === "b") return <sub key={index}>{value}</sub>;
							//if number -> superscript
							else if (!isNaN(value)) return <sup key={index}>{value}</sup>;
							//else, boring
							else return value;
						})}
					</span>
				</span>
			);
		});
		return (
			<span className="flex flex-row mb-2 transition">
				{progressionDisplay}
			</span>
		);
	};

	render() {
		const progressionDisplay = this._renderProgression(
			mapProgressionToKey(
				this.props.progression,
				this.state.previousKey,
				this.state.key
			)
		);

		return (
			<div className="flex flex-col text-center p-12 shadow-lg bg-white rounded">
				<div className="self-start text-left py-8 px-10 mb-6 bg-grey-lighter rounded">
					{progressionDisplay}
					<span
						className="text-grey-dark hover:text-grey cursor-pointer transition"
						onClick={() => {
							let progessionInKey = mapProgressionToKey(
								this.props.progression,
								this.state.previousKey,
								this.state.key
							);
							let chordNotes = getChordNotes(progessionInKey);
							this.props.downloadMidi(chordNotes);
						}}
					>
						download midi
					</span>
				</div>
				<div className="flex mb-6">
					<select
						name="key"
						className="rounded bg-grey-lighter leading-none text-secondary p-2"
						value={this.state.key}
						onChange={this._onKeyChange}
					>
						{keys.map((key, index) => (
							<option key={index} value={key.value}>
								{key.label}
							</option>
						))}
					</select>
				</div>
				<div className="flex justify-end">
					<button
						className={`btn bg-${this.props.color} text-white transition mr-4`}
						onClick={this._listen}
					>
						{!this.state.playing ? "listen?" : "stop"}
					</button>
					<button
						className="btn btn-ghost transition"
						onClick={this.props.generate}
					>
						regenerate
					</button>
				</div>
			</div>
		);
	}
}

export default Progression;
