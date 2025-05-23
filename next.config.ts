import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "robohash.org",
      "avatars.githubusercontent.com",
      "i.pravatar.cc",
      "evidently-handy-troll.ngrok-free.app",
    ],
  },
};

export default nextConfig;
