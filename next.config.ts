import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow the dev server to serve HMR / font / static dev resources to these
  // non-localhost origins (e.g. accessing the site over your LAN / Tailscale IP).
  allowedDevOrigins: ["100.122.125.15"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
