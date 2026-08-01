import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $shared: resolve(__dirname, "./src/shared"),
      $apps: resolve(__dirname, "./src/apps"),
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "jsdom",
  },
});
