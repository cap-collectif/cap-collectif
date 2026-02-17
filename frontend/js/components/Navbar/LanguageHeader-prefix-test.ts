import { getPrefixedPath } from './LanguageHeader'

describe('LanguageHeader getPrefixedPath', () => {
  it('returns a trailing slash for homepage locale prefix', () => {
    expect(getPrefixedPath('en-GB', '/', ['fr-FR', 'en-GB'])).toBe('/en/')
  })
})
