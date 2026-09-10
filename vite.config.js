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
        // Precachea el shell de la app (JS/CSS/HTML/imágenes del build)
        // para que abra offline y no vuelva a pedir estos archivos en
        // cada visita. OJO: incluye webp — los 12 assets del diseño
        // (fondos, botones tallados, íconos del nav) son todos webp,
        // si se te olvida agregarlo acá no se cachean y cada carga los
        // vuelve a pedir a la red.
        globPatterns: ["**/*.{js,css,html,png,svg,webp,ico}"],
        runtimeCaching: [
          {
            // Fuentes de Google — nunca cambian para una misma URL,
            // así que van con CacheFirst (usa la caché sin ni
            // preguntarle a la red) y expiran recién al año.
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-css",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
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
