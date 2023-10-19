import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import type { State } from '~/types'
type BaseTranslation = {
  readonly locale: string
  readonly [key: string]: string | null | undefined
}
type TranslationItem<T> = T & {
  readonly locale: string
}
type Translations<T extends BaseTranslation> = ReadonlyArray<TranslationItem<T>>
type Props = {
  defaultLanguage: string | null | undefined
  field: string
  translations: Translations<BaseTranslation>
  fallback?: string | null | undefined
}
export const getTranslation = <T extends BaseTranslation>(
  translations: Translations<T> | null | undefined,
  defaultLanguage: string | null | undefined,
): TranslationItem<T> | null | undefined =>
  translations ? translations.find(({ locale }) => defaultLanguage === locale) || null : null
export const getTranslationField = <T extends BaseTranslation>(
  translations: Translations<T> | null | undefined,
  defaultLanguage: string | null | undefined,
  field: string,
): string => {
  const translation = getTranslation(translations, defaultLanguage)
  return translation && translation[field] ? translation[field] : ''
}
export function Translation({ field, translations, fallback, defaultLanguage }: Props) {
  const translation = getTranslation(translations, defaultLanguage)

  if (translation && translation[field]) {
    return <strong>{translation[field]}</strong>
  }

  if (fallback) {
    return <FormattedMessage id={fallback} />
  }

  return null
}
export const isTranslationNew = <T extends BaseTranslation>(
  translations: Translations<T>,
  defaultLanguage: string | null | undefined,
): boolean => !getTranslation(translations, defaultLanguage)
export const handleTranslationChange = <T extends BaseTranslation>(
  translationsSource: Translations<T>,
  translationsEdited: TranslationItem<T>,
  defaultLanguage: string | null | undefined,
): Translations<T> => {
  // We are creating a new array of translations
  if (translationsSource === []) {
    return [translationsEdited]
  }

  const isCreating = isTranslationNew(translationsSource, defaultLanguage)

  // We are creating a new translation
  if (isCreating) {
    return [...translationsSource, translationsEdited]
  }

  // We are creating a new translation
  if (!isCreating) {
    // We delete the translation from the array
    const translationsFiltered = translationsSource.filter(({ locale }) => defaultLanguage !== locale)
    // We replace the translation by the new one
    return [...translationsFiltered, translationsEdited]
  }

  return []
}
// from fr-FR to FR_FR
export function formatLocaleToCode(locale: string): string {
  return locale.replace('-', '_').toUpperCase()
}

const mapStateToProps = ({ language }: State) => ({
  defaultLanguage: language.currentLanguage,
})

export default connect<any, any>(mapStateToProps)(Translation)
