import React from "react";
import { useNearContext } from "../context/nearContext";

export default function LoginBtn({ style }) {
	const { modal, signOut, accountId } = useNearContext();

	if (!accountId) {
		return (
			<button style={style} onClick={() => modal.show()}>
				Login
			</button>
		);
	} else {
		return (
			<button style={style} onClick={signOut}>
				Logout
			</button>
		);
	}
}
