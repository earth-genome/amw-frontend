/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  //output: 'export'
  //images: { unoptimized: true },
  //trailingSlash: true,
  async redirects() {
    return [
      {
      "source": "/:lang/methods-and-code",
        destination: "/:lang/data-code-and-methods",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
