import { TranslationLocale } from '@relay/CustomPageFormWrapper_ViewerQuery.graphql'

export type Locale = {
  code: TranslationLocale
  id: string
  isDefault: boolean
  traductionKey: string
}

export type CustomPageCover = {
  id: string
  name: string
  size: string
  type: string
  url: string
}

// Translated fields are registered dynamically as `${localeCode}-title`, `${localeCode}-body` and
// `${localeCode}-metaDescription`, e.g. `FR_FR-title`.
export type CustomPageFormValues = {
  isEnabled: boolean
  cover: CustomPageCover | null
  customCode: string
  [translatedField: string]: string | boolean | CustomPageCover | null
}
