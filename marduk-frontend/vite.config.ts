import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3000', // Changed to 0.0.0.0 to bind to all interfaces
        changeOrigin: true,
        secure: false,
        ws: true // added ws support for consistency
      },
      '/ws': {
        target: 'ws://0.0.0.0:3000', // Changed to 0.0.0.0 to bind to all interfaces
        ws: true,
        changeOrigin: true,
        secure: false // added secure for consistency
      }
    }
  }
});