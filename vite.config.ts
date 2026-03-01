import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT) || 3000,
    strictPort: true,

    // ✅ allow your exact Replit host + all replit subdomains
    allowedHosts: [
      "c107407e-494f-49a9-8608-8611bdcff91f-00-1dj8f92ryzeuv.worf.replit.dev",
      ".replit.dev",
      ".repl.co"
    ],
  },
  plugins: [react()],
});
