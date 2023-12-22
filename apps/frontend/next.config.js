/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: "/:path*",
        destination: "/",
      },
    ];
  },
};

module.exports = nextConfig;
