import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: "src/index.html",
        induno: "src/induno.html",
        varese: "src/varese.html",
        gestione: "src/gestione.html"
      }
    }
  }
});