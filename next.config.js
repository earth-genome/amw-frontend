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

// public url of the Vercel Blob store of the Panorama PDFs, built from its token like
// @vercel/blob does, e.g. "https://<store id>.public.blob.vercel-storage.com"
const getBlobStoreUrl = () => {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId
    ? `https://${storeId}.public.blob.vercel-storage.com`
    : undefined;
};

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    // the Chromium binary used to generate the Panorama PDFs is loaded at runtime
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
    outputFileTracingIncludes: {
      "/api/panorama-pdf/[lang]/[issue]": [
        "./node_modules/@sparticuz/chromium/bin/**",
      ],
      "/api/panorama-pdf/webhook": [
        "./node_modules/@sparticuz/chromium/bin/**",
      ],
    },
  },
  images: {
    remotePatterns: cmsImagesRemotePatterns,
  },
  async rewrites() {
    const blobStoreUrl = getBlobStoreUrl();
    return {
      // the Panorama PDFs are served from the site, e.g. with its favicon, but the CDN
      // fetches them from the Blob store, so they don't go through a function
      beforeFiles: blobStoreUrl
        ? [
            {
              source: "/panorama-pdf/:path*",
              destination: `${blobStoreUrl}/panorama-pdf/:path*`,
            },
          ]
        : [],
    };
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
