import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Forward API calls to the backend dev server
      "/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/process": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/summary": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/download": {
        target: "http://localhost:4000",
        changeOrigin: true,
      }
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
