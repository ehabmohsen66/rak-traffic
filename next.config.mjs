/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: new URL('.', import.meta.url).pathname,
  },
};

export default nextConfig;
