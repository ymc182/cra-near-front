import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { NearWrapper } from "./src/context/nearContext";

const reactRoot = createRoot(document.querySelector("#root"));

reactRoot.render(
	<NearWrapper>
		<App />
	</NearWrapper>
);
