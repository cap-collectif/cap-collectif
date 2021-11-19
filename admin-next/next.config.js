// @ts-check

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
const nextConfig = {
  // TODO enable this
  webpack5: false,
  // TODO enable this
  reactStrictMode: false,
  basePath: process.argv.includes('dev') ? '' : '/admin-next',
  i18n: {
    localeDetection: true,
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL', 'sv-SE', 'eu-EU', 'oc-OC'],
  },
  experimental: {
    externalDir: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ['@svgr/webpack'],
    });

    if (!isServer) {
      config.node = {
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
      };
    }

    return config;
  },
};

module.exports = nextConfig;
