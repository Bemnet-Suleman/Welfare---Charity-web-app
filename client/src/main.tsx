import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Remove preloader after app mounts / when window loads
function removePreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  el.classList.add("preloader-hidden");
  // restore page scrolling and remove element after transition
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  setTimeout(() => el.remove(), 450);
}
function initPreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  // prevent scrolling while preloader is visible
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
  // ensure preloader fills viewport even on mobile
  el.classList.add("preloader-root-fixed");
}

if (document.readyState === "complete") {
  initPreloader();
  removePreloader();
} else {
  initPreloader();
  window.addEventListener("load", removePreloader);
  // fallback: wait long enough for the new 2400ms animation to finish
  setTimeout(removePreloader, 2800);
}
