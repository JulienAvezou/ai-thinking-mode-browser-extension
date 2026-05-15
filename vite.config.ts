import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@integrations/eventRecorder": resolve(__dirname, "src/integrations/eventRecorder.ts")
    }
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/sidepanel.html"),
        serviceWorker: resolve(__dirname, "src/background/serviceWorker.ts"),
        contentScript: resolve(__dirname, "src/content/contentScript.ts")
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
