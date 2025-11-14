/* eslint-env jest */

beforeEach(async () => {
  const testFile = expect.getState().testPath

  // Enable this feature ONLY for the public/ and preview/ folders
  if (/\/(public|preview)\//.test(testFile)) {
    await global.enableFeatureFlag('public_api')
  }
})
