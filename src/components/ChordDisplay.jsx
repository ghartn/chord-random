import React from "react";
import { FiLock, FiUnlock, FiPlay, FiPause } from "react-icons/fi";

const ChordDisplay = ({ chord, toggleLock, togglePlay, playing }) => {
	let root = chord.root;
	let type = chord.type.split("");
	return (
		<span
			className={`flex flex-1 flex-wrap tracking-wide py-2 md:py-6 px-4 justify-center md: justify-between items-center bg-${
				chord.color
			} transition`}
		>
			<div className="md:w-full md:text-center mb-4">
				<span className="text-3xl text-white">{root}</span>
				<span className="text-grey-lightest text-lg">
					{type.map((value, index) => {
						//if 'flat' symbol
						if (value === "b") return <sub key={index}>{value}</sub>;
						//if number or sharp
						else if (!isNaN(value) || value === "#")
							return <sup key={index}>{value}</sup>;
						//else, boring
						else return value;
					})}
				</span>
			</div>
			<span
				className="md:w-full md:text-center text-white transition cursor-pointer mb-4"
				onClick={() => toggleLock(chord)}
			>
				{chord.lock ? <FiLock size="1.25em" /> : <FiUnlock size="1.25em" />}
			</span>
			<span
				className="md:w-full md:text-center text-white transition cursor-pointer "
				onClick={() => togglePlay(chord)}
			>
				{playing ? <FiPause size="1.25em" /> : <FiPlay size="1.25em" />}
			</span>
		</span>
	);
};

export default ChordDisplay;
