import React from "react";
import { lockClosed, lockOpen } from "../components/Icons";

const ChordDisplay = ({ chord, toggleLock }) => {
	let root = chord.root;
	let type = chord.type.split("");
	return (
		<span
			className={`flex flex-1 flex-wrap tracking-wide py-2 md:py-6 px-4 justify-center md: justify-between items-center bg-${
				chord.color
			} transition`}
		>
			<div className="md:w-full md:text-center mb-2">
				<span className="text-3xl text-white">{root}</span>
				<span className="text-grey-lightest text-lg">
					{type.map((value, index) => {
						//if 'flat' symbol
						if (value === "b") return <sub key={index}>{value}</sub>;
						//if number -> superscript
						else if (!isNaN(value)) return <sup key={index}>{value}</sup>;
						//else, boring
						else return value;
					})}
				</span>
			</div>
			<span
				className="md:w-full md:text-center text-white transition cursor-pointer"
				onClick={() => toggleLock(chord)}
			>
				{chord.lock ? lockClosed() : lockOpen()}
			</span>
		</span>
	);
};

export default ChordDisplay;
