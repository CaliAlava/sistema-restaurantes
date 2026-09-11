/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@restaurantes/ui', '@restaurantes/config', '@restaurantes/database'],
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
