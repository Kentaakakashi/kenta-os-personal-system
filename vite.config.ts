import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: "all",
  },
  plugins: [react()],
});
