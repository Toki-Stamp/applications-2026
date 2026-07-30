import { mount } from "svelte";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/jetbrains-mono/800.css";
import "./components/ui/md-icon.js";
import "./app.css";
import AdminApp from "./components/admin/AdminApp.svelte";

const app = mount(AdminApp, {
  target: document.getElementById("app"),
});

export default app;
