import React from "react";

const Loader = ({ loading, color }) => {
	const loader = loading ? (
		<div className="loader absolute">
			<div className={`cube1 w-2 h-2 absolute bg-${color}`} />
			<div className={`cube2 w-2 h-2 absolute bg-${color}`} />
		</div>
	) : null;
	return loader;
};

export default Loader;
