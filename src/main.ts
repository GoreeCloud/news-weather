import "./styles.css";
import { createNewsWeatherApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("News & Weather application root was not found.");
}

createNewsWeatherApp(root);
