import React from "react";
import { useNearContext } from "../context/nearContext";

export default function LoginBtn() {
	const { modal, signOut, accountId } = useNearContext();

	if (!accountId) {
		return <button onClick={() => modal.show()}>Login</button>;
	} else {
		return <button onClick={signOut}>Logout</button>;
	}
}
