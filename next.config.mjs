/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'api.broeditz.com',
      },
      // Keep localhost for optional backend integration
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8005',
      },
    ],
    // Allow unoptimized youtube thumbnails via <img> fallback remains, but next/image now supports yt
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
