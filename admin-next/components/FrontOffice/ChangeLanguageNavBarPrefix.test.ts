import { getPrefixedPath } from './ChangeLanguageNavBar'

describe('ChangeLanguageNavBar getPrefixedPath', () => {
  it('returns a trailing slash for homepage locale prefix', () => {
    expect(getPrefixedPath('en-GB', '/', ['fr-FR', 'en-GB'])).toBe('/en/')
  })
})
