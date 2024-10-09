import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "src",
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  base: '/dune/', // Replace with your actual repository name
});
