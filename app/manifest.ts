import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SamaSangha",
    short_name: "SamaSangha",
    description: "Sufi spiritual community in Massachusetts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe1",
    theme_color: "#036007",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
