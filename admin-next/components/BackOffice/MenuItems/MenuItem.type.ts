import type { TranslationLocale } from '@relay/MenuItemFormWrapperQuery.graphql'

export type Locale = {
  code: TranslationLocale
  isDefault: boolean
  traductionKey: string
}

export type MenuItemFormValues = {
  menu: 'HEADER' | 'FOOTER'
  parent: string
  page: string
  // Empty until the admin chooses a position for a new item
  position: number | ''
  isEnabled: boolean
  isExternalLink: boolean
} & Record<string, string | number | boolean>
