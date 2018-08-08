import React, { Component } from "react";
import { HashRouter as Router, Switch } from "react-router-dom";
import BaseRoute from "./layouts/BaseRoute";
import HomePage from "./pages/HomePage";

class App extends Component {
	render() {
		return (
			<Router basename={process.env.PUBLIC_URL}>
				<Switch>
					<BaseRoute path="/:progression?" component={HomePage} />
				</Switch>
			</Router>
		);
	}
}

export default App;
