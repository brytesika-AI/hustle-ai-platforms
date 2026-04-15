/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: {
    typedRoutes: true,
    externalDir: true
  },
  transpilePackages: ["@hustle-ai/shared-frontend"]
};

export default nextConfig;
