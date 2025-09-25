import type { MetadataRoute } from "next";

const SITE_NAME = "Hinn.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hinn.dev";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Hinn.dev",
    description: "Pay‑by‑month, all‑inclusive website design.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0e0b08",
    theme_color: "#1a73e8",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
