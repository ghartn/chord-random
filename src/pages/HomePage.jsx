import React, { Component } from "react";
import { generateProgression, generateMidi } from "../utils/chords";
import Progression from "../components/Progression";
import Loader from "../components/Loader";

const COLORS = [
	"greenblue",
	"cyan",
	"sky",
	"violet",
	"mint",
	"seablue",
	"blue",
	"purple",
	"peach",
	"pink",
	"yellow",
	"orange",
	"red",
	"magenta"
];

class HomePage extends Component {
	constructor() {
		super();
		this.state = {
			loading: false,
			color: "grey-darkest",
			progression: []
		};
	}

	componentDidMount() {
		this._randomizeColor();
	}

	_randomizeColor = () => {
		let randomIndex = Math.floor(Math.random() * COLORS.length);
		let color = COLORS[randomIndex];
		while (color === this.state.color) {
			randomIndex = Math.floor(Math.random() * COLORS.length);
			color = COLORS[randomIndex];
		}
		this.setState({
			color
		});
	};

	_downloadMidi = progression => {
		this._randomizeColor();
		window.open(generateMidi(progression));
	};

	_generate = key => {
		let generateKey = key || "C";
		console.log(generateKey);
		this._randomizeColor();
		let progression = generateProgression(generateKey);
		this.setState({
			progression
		});
	};

	render() {
		const { color } = this.state;
		return (
			<div
				className={`flex flex-1 items-center justify-center mx-auto w-full bg-${color} transition`}
			>
				<div className="flex flex-col container">
					<Loader loading={this.state.loading} color={color} />
					{this.state.progression.length > 0 ? (
						<Progression
							color={color}
							progression={this.state.progression}
							generate={this._generate}
							downloadMidi={this._downloadMidi}
						/>
					) : (
						<button
							className="text-5xl text-grey-lightest hover:text-white text-shadow transition"
							onClick={() => this._generate()}
						>
							generate
						</button>
					)}
				</div>
			</div>
		);
	}
}

export default HomePage;
