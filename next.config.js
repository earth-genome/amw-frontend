// Strapi server, for uploads with relative urls, e.g. "/uploads/image.jpg" in a local instance
const getStrapiRemotePattern = () => {
  try {
    const { protocol, hostname, port } = new URL(
      process.env.STRAPI_API_ENDPOINT,
    );
    return { protocol: protocol.replace(":", ""), hostname, port };
  } catch (_e) {
    return undefined;
  }
};

// hosts of the CMS media displayed with next/image
const cmsImagesRemotePatterns = [
  // S3 bucket of the Strapi uploads
  {
    protocol: "https",
    hostname: "s3.us-east-2.amazonaws.com",
    pathname: "/amw-media/**",
  },
  getStrapiRemotePattern(),
].filter(Boolean);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: cmsImagesRemotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/:lang/methods-and-code",
        destination: "/:lang/data-code-and-methods",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  org: "eg-nu",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
