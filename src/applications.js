import { mount } from "svelte";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/jetbrains-mono/800.css";
import "material-symbols/outlined.css";
import "@material/web/icon/icon.js";
import "./app.css";
import ApplicationsApp from "./ApplicationsApp.svelte";

const app = mount(ApplicationsApp, {
  target: document.getElementById("app"),
});

export default app;
