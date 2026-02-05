import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "AppEnglish - Verbs",
        short_name: "AppEnglish",
        description: "Practice English verbs offline with quick quizzes.",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache verbs.json
            urlPattern: ({ url }) => url.pathname.endsWith("/verbs.json"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "verbs-json",
              expiration: { maxEntries: 5, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            // Cache external images (e.g., images.unsplash.com)
            urlPattern: ({ url }) =>
              url.origin.includes("images.unsplash.com") ||
              url.origin.includes("istockphoto.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "external-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ]
});
