

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  webpack: (config) => {
    // Fix for Speckle's internal usage of #lodash
    config.resolve.alias['#lodash'] = 'lodash';

    return config;
  },
  // Optional: Ensure strict mode is off if you hit other third-party issues
  reactStrictMode: true,
  // Optional: If you get "module not found" for fs/child_process in client
  experimental: {
    serverComponentsExternalPackages: ['@speckle/objectloader', '@speckle/shared'],
  },
};

export default nextConfig;

