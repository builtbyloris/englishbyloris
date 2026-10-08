import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "*.googleusercontent.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
