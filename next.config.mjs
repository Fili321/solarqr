/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large video uploads via API routes
  api: {
    bodyParser: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;
