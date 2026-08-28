import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Junín Anuncios",
        short_name: "J. Anuncios",
        description: "Anuncios y oportunidades cerca de ti, en Junín.",
        lang: "es",
        start_url: "/",
        display: "standalone",
        // Mismos tokens que src/index.css (--ink y --paper)
        theme_color: "#3b2418",
        background_color: "#f3e6c8",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precachea el shell de la app (JS/CSS/HTML del build) para que
        // abra offline. Los anuncios en sí necesitan red — eso se maneja
        // aparte con runtimeCaching abajo, no como parte del shell.
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        runtimeCaching: [
          {
            // Llamadas al backend (Railway) — network-first: intenta traer
            // datos frescos, y si no hay red, sirve la última respuesta
            // guardada en vez de romper la pantalla.
            urlPattern: ({ url }) => url.origin !== self.location.origin,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // host:true permite probar desde el celular en la misma red
  // durante desarrollo (útil para probar la PWA en un dispositivo real).
  server: {
    host: true,
    port: 5173,
  },
});
