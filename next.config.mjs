/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev server is reached as 127.0.0.1 while Next treats its host as localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
