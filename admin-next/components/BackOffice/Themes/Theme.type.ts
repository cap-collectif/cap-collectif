import { TranslationLocale } from '@relay/ThemeFormWrapperQuery.graphql'

export type Locale = {
  code: TranslationLocale
  id: string
  isDefault: boolean
  traductionKey: string
}

// Select value standing for "no status", react-select options cannot hold null
export const NO_STATUS = 'NONE'

// Translated fields are stored under `${locale}-${field}` keys, e.g. "FR_FR-title"
export type ThemeFormValues = {
  author?: { label: string; value: string } | null
  media?: { id: string; url: string } | null
  isEnabled: boolean
  position: number
  status: string
  customCode: string
} & Record<string, unknown>
