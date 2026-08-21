import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/catering-in-seattle",
        destination: "/seattle",
        permanent: true,
      },
      {
        source: "/catering-in-bellevue",
        destination: "/bellevue",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
