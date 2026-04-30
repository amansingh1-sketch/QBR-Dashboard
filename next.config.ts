import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HubSpot API calls happen server-side only; no browser exposure needed
  serverExternalPackages: [],
};

export default nextConfig;
