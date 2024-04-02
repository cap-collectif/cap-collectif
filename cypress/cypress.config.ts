import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: './fixtures',
  screenshotsFolder: './screenshots',
  videosFolder: './videos',
  viewportWidth: 1280,
  viewportHeight: 1000,
  chromeWebSecurity: false,
  retries: 2,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./plugins/index.ts')(on, config)
    },
    specPattern: './integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './support/index.ts',
    baseUrl: 'https://capco.test',
  },
})
