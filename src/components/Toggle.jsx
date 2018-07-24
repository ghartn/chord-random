import React from "react";

const Toggle = ({ id, value, label, onChange }) => {
	let textLabel = label ? (
		<span className="block text-grey pb-2">{label}</span>
	) : null;
	return (
		<div className="toggle flex flex-col">
			{textLabel}
			<input id={id} type="checkbox" value={value} onChange={onChange} />
			<label className="toggle-label self-start" htmlFor={id} />
		</div>
	);
};

export default Toggle;
