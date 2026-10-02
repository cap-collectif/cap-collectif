import { getPrefixedPath } from './FooterWrapperLegacy'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('FooterWrapperLegacy getPrefixedPath', () => {
  it('returns a trailing slash for homepage locale prefix', () => {
    expect(getPrefixedPath('en-GB', '/', ['fr-FR', 'en-GB'])).toBe('/en/')
  })
})
