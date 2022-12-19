import "regenerator-runtime/runtime";
import React from "react";

import "./assets/global.css";
import { useNearContext } from "./src/context/nearContext";
import LoginBtn from "./src/components/LoginBtn";

export default function App() {
	const { modal } = useNearContext();
	return (
		<>
			<LoginBtn />
			<main>
				<h1></h1>
			</main>
		</>
	);
}
