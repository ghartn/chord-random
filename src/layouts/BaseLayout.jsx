import React, { Component } from "react";
//import { Link } from "react-router-dom"
//import logo from "../img/logo.png"

class BasicLayout extends Component {
	render() {
		const { children } = this.props;
		return (
			<div className="min-h-screen flex flex-col antialiased leading-tight">
				{/* <div className="flex flex-between h-16 px-6 items-center shadow">
					<div className="flex items-center  w-32 py-2 h-full">
						<Link to="/" className="no-underline">
							<h1 className="text-primary text-lg">logo</h1>
						</Link>
					</div>
					<ul className="list-reset flex justify-end flex-1">
						<li className="px-4">
							<a href="#" className="no-underline text-primary hover:text-primary-dark">link 1</a>
						</li>
						<li className="px-4">
							<a href="#" className="no-underline text-primary hover:text-primary-dark">link 2</a>
						</li>
						<li className="px-4">
							<a href="#" className="no-underline text-primary hover:text-primary-dark">link 3</a>
						</li>
					</ul>
				</div> */}
				{children}
			</div>
		);
	}
}

export default BasicLayout;
