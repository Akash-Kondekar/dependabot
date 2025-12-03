import React from "react";
import { createRoot } from "react-dom/client";
import { SwitchRoutes } from "./components/Routes/Routes";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<SwitchRoutes tab="root" />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
serviceWorker.unregister();
