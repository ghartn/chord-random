import React from "react";
import { FiLock, FiUnlock, FiPlay, FiPause } from "react-icons/fi";

const ChordDisplay = ({ chord, toggleLock, togglePlay }) => {
	let root = chord.root;
	let type = chord.type.split("");
	return (
		<li
			className={`cursor-move select-none flex flex-1 flex-wrap tracking-wide py-2 md:py-6 px-4 justify-center md: justify-between items-center bg-${
				chord.color
				}`}
		>
			<div className="md:w-full md:text-center mb-4 text-shadow-sm">
				<span className="text-3xl text-white">{root}</span>
				<span className="text-grey-lightest text-lg">
					{type.map((value, index) => {
						//if 'flat' symbol
						if (value === "b") return <sub key={index}>{value}</sub>;
						//if number or sharp
						else if (!isNaN(value) || value === "#" || value === "o")
							return <sup key={index}>{value}</sup>;
						//else, boring
						else return value;
					})}
				</span>
			</div>
			<div className="md:flex md:w-full flex-wrap flex-col md:flex-row text-center text-shadow-sm z-20">
				<button
					className="md:w-full md:text-center text-white  cursor-pointer mb-4 mr-4 md:mr-0"
					onClick={() => toggleLock(chord)}
				>
					{chord.lock ? <FiLock size="1.25em" /> : <FiUnlock size="1.25em" />}
				</button>
				<button
					className="md:w-full md:text-center text-white  cursor-pointer "
					onClick={() => togglePlay(chord)}
				>
					{chord.playing ? <FiPause size="1.25em" /> : <FiPlay size="1.25em" />}
				</button>
			</div>
		</li>
	);
};

export default ChordDisplay;
