import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
