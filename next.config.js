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
  
  // Static file serving configuration
  async rewrites() {
    // Only serve dev-scripts in development mode
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/dev-scripts',
          destination: '/api/dev-scripts'
        },
        {
          source: '/dev-scripts/:path*',
          destination: '/api/dev-scripts/:path*'
        }
      ];
    }
    return [];
  },
  
  // Headers configuration for security
  async headers() {
    const headers = [];
    
    // In production, block access to dev-scripts
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/dev-scripts/:path*',
        headers: [
          {
            key: 'x-robots-tag',
            value: 'noindex, nofollow'
          }
        ],
        // This will be handled by middleware to return 404
      });
    }
    
    return headers;
  },
  
  // Additional production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Additional production-only optimizations can go here
  }),
};

module.exports = withBundleAnalyzer(nextConfig);