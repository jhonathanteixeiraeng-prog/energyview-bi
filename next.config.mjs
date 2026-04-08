/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['recharts', 'victory-vendor', 'd3-array', 'd3-scale', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-color'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
