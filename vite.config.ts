import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "./" makes the build work from any folder, not only the domain root.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
