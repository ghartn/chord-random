import React, { Component } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import BaseRoute from "./layouts/BaseRoute";
import HomePage from "./pages/HomePage";

class App extends Component {
	render() {
		return (
			<Router>
				<Switch>
					<BaseRoute exact path="/" component={HomePage} />
				</Switch>
			</Router>
		);
	}
}

export default App;
