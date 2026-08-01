import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $shared: resolve(__dirname, "./src/shared"),
      $apps: resolve(__dirname, "./src/apps"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        applications: resolve(__dirname, "applications.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
});
