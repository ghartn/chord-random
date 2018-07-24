import React from "react";
import BaseLayout from "./BaseLayout";
import { Route } from "react-router-dom";

const BasicRoute = ({ component: Component, children, ...rest }) => {
	return (
		<Route
			{...rest}
			render={matchProps => (
				<BaseLayout {...matchProps}>
					<Component {...matchProps} />
					{children}
				</BaseLayout>
			)}
		/>
	);
};

export default BasicRoute;
