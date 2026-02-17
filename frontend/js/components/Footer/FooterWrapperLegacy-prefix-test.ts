import { getPrefixedPath } from './FooterWrapperLegacy'

describe('FooterWrapperLegacy getPrefixedPath', () => {
  it('returns a trailing slash for homepage locale prefix', () => {
    expect(getPrefixedPath('en-GB', '/', ['fr-FR', 'en-GB'])).toBe('/en/')
  })
})
