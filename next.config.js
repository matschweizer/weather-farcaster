/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the SDK to be imported client-side
  transpilePackages: ["@farcaster/miniapp-sdk"],
};

module.exports = nextConfig;
