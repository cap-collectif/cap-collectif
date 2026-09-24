import { TranslationLocale } from '@relay/VideoFormWrapperQuery.graphql'

export type Locale = {
  code: TranslationLocale
  id: string
  isDefault: boolean
  traductionKey: string
}

export type VideoFormValues = {
  link?: string
  author?: { label: string; value: string } | null
  media?: { id: string; url: string } | null
  isEnabled: boolean
  position: number
  currentLocale: string
}
