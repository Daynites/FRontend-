import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Telegram abre la Mini App dentro de un WebView — 0.0.0.0 permite
  // probar desde el celular en la misma red durante desarrollo.
  server: {
    host: true,
    port: 5173,
  },
});
