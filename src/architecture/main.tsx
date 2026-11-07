import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "@fontsource-variable/funnel-display";
import "@fontsource-variable/funnel-sans";
import "@fontsource/fragment-mono";
import "../styles/tailwind.css";
import "../styles/tokens.css";
import "../styles/base.css";
import ArchitecturePage from "./ArchitecturePage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ArchitecturePage />
    </MotionConfig>
  </StrictMode>,
);
