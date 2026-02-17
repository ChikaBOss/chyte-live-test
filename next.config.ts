import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS domains for external images
      },
    ],
    // Allow base64 images
    unoptimized: true, // Set to true if you're having optimization issues
  },
  
  // Webpack configuration with proper types
  webpack: (config: any, { isServer, dev }: { isServer: boolean; dev: boolean }) => {
    // Fix for canvas/node-gyp issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }
    
    return config;
  },
  
  // Enable experimental features if needed
  experimental: {
    // appDir: true, // If using the app directory
  },
};

export default nextConfig;