import { Locale } from 'types'
import { resolveRequestLocale } from './request-locale'

describe('resolveRequestLocale', () => {
  it('prefers locale from header over cookie', () => {
    expect(resolveRequestLocale(Locale.enGB, Locale.frFR)).toBe(Locale.enGB)
  })

  it('uses cookie locale when header locale is not supported', () => {
    expect(resolveRequestLocale('jp-JP', Locale.deDE)).toBe(Locale.deDE)
  })

  it('falls back to default locale when header and cookie are invalid', () => {
    expect(resolveRequestLocale('jp-JP', 'it-IT')).toBe(Locale.frFR)
  })
})
