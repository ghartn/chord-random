import React from "react";
import BaseLayout from "./BaseLayout";
import { parse } from "querystringify";
import { Route } from "react-router-dom";

const BasicRoute = ({ component: Component, children, ...rest }) => {
	const _parseSearch = props => {
		let search = {};
		if (props.location.search && props.location.search.length >= 0) {
			search = parse(props.location.search);
		}
		return search;
	};
	return (
		<Route
			{...rest}
			render={matchProps => (
				<BaseLayout {...matchProps}>
					<Component {...matchProps} search={_parseSearch({ ...matchProps })} />
					{children}
				</BaseLayout>
			)}
		/>
	);
};

export default BasicRoute;
