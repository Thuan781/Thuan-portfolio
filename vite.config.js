import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          "three-vendor": ["three"]
        }
      }
    }
  }
});
