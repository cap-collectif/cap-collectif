// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // TODO enable this
  reactStrictMode: false,
  basePath: process.env.SYMFONY_ENV === 'prod' ? '/admin-next' : '',
  env: {
    PRODUCTION: String(process.env.SYMFONY_ENV === 'prod'),
  },
  i18n: {
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL', 'sv-SE', 'eu-EU', 'oc-OC', 'ur-IN'],
  },
  excludeDefaultMomentLocales: false,
  experimental: {
    externalDir: true,
  },
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // We check the type errors separately on our CI build
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // We check the linting errors separately on our CI build
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
    relay: {
      language: 'typescript',
      src: './',
      artifactDirectory: './__generated__',
      excludes: ['**/.next/**', '**/node_modules/**', '**/schema/**', '**/__generated__/**'],
    },
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(js|ts)x?$/,
      use: ['@svgr/webpack'],
    })
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      include: /..\/node_modules\/(?=(react-leaflet|@react-leaflet\/core)\/).*/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
      },
    })

    if (!isServer) {
      config.resolve.fallback = {
        net: false,
        tls: false,
        child_process: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      }
    }

    return config
  },
}

module.exports = nextConfig
