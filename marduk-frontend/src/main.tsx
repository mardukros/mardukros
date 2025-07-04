import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { TempoDevtools } from "tempo-devtools";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./ErrorBoundary";

function Root() {
  useEffect(() => {
    if (import.meta.env.VITE_TEMPO) {
      TempoDevtools.init();
    }
  }, []);

  return (
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
