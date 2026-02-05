import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

async function main() {
    const rootElem = document.createElement("div");
    rootElem.id = "react";

    document.body.appendChild(rootElem);

    createRoot(rootElem).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}

main();
