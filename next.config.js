const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Performance and optimization settings
  compiler: {
    // Remove console statements in production builds
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error statements
    } : false,
  },
  
  // Additional production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Additional production-only optimizations can go here
  }),
};

module.exports = withBundleAnalyzer(nextConfig);