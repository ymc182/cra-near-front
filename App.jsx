import "regenerator-runtime/runtime";
import React from "react";
import img from "./assets/logo-white.svg";
import "./assets/global.css";
import { useNearContext } from "./src/context/nearContext";
import LoginBtn from "./src/components/LoginBtn";

export default function App() {
	const { modal } = useNearContext();
	return (
		<>
			<LoginBtn
				style={{
					position: "absolute",
					top: "1rem",
					right: "1rem",
				}}
			/>
			<main style={{ display: "flex", placeContent: "center" }}>
				<img src={img} width="50%" alt="logo" />
			</main>
		</>
	);
}
