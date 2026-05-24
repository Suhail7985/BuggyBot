import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/api/ai/health',
        destination: `${aiServiceUrl}/health`,
      },
      {
        source: '/api/ai/:path*',
        destination: `${aiServiceUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
