// Primeiro import: `?movimento=1` troca a resposta de "reduzir movimento" antes de todos.
import "./lib/motionOverride";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
