import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Check if root already exists to prevent multiple createRoot calls
let root: ReturnType<typeof createRoot>;

// For development with HMR, we need to handle re-mounting
if (container._reactRootContainer) {
  // If there's already a root, just render the new app
  root = container._reactRootContainer;
} else {
  // Create new root and store reference
  root = createRoot(container);
  container._reactRootContainer = root;
}

// Render the app
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    // Re-render the app when App.tsx changes
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}
