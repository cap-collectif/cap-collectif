import { TranslationLocale } from '@relay/NavBarQuery.graphql'
import { IntlShape } from 'react-intl'

export type PlatformLocale = {
  code: TranslationLocale
  id: string
  isDefault: boolean
  traductionKey: string
}

/**
 * Takes a copy of the platform locales as param and returns the full object of the platform's default locale
 */
export const getDefaultLocale = (platformLocales: Array<PlatformLocale>): PlatformLocale => {
  return platformLocales.find(locale => locale.isDefault === true)
}

/**
 * Takes a copy of the platform's available locales and returns an array of locales formatted for a form, with the default locale first
 * @param platformLocales Array of the platform's available locales
 * @returns Array<{value: localeCode, label: localeTranslationKey}>
 */
export const getFormattedPlatformLocales = (platformLocales: Array<PlatformLocale>, intl: IntlShape) => {
  const sortedLocales = platformLocales.sort((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return 0
  })

  return sortedLocales.map(locale => ({
    value: locale.code,
    label: intl.formatMessage({ id: locale.traductionKey }),
  }))
}
