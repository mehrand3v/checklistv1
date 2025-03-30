import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App.jsx";
import Wrapper from "@/components/Wrapper.jsx"; // Import Wrapper
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </StrictMode>
);
