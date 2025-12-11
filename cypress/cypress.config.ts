import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: './fixtures',
  screenshotsFolder: './screenshots',
  videosFolder: './videos',
  viewportWidth: 1280,
  viewportHeight: 1000,
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 15000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  taskTimeout: 70000, // Time, in milliseconds, to wait for a task to finish executing during a cy.task() command.
  requestTimeout: 15000, // Time, in milliseconds, to wait for a request to go out in a cy.wait() command.
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./plugins/index.ts')(on, config)
    },
    specPattern: ['./e2e/**/*.cy.{js,jsx,ts,tsx}'],
    supportFile: './support/index.ts',
    baseUrl: 'https://capco.test',
    testIsolation: true,
  },
})
