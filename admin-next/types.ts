import { TranslationLocale } from '@relay/NavBarQuery.graphql'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'

export type SymfonyEnv = 'dev' | 'prod' | 'test'

export type PageProps = {
  viewerSession: ViewerSession
  appVersion: string
  intl: IntlType
  featureFlags: FeatureFlags
}

export enum Locale {
  frFR = 'fr-FR',
  enGB = 'en-GB',
  esES = 'es-ES',
  deDE = 'de-DE',
  nlNL = 'nl-NL',
  svSE = 'sv-SE',
  ocOC = 'oc-OC',
  euEU = 'eu-EU',
  urIN = 'ur-IN',
}

export type ViewerSession = {
  email: string
  username: string
  id: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isProjectAdmin: boolean
  isAdminOrganization: boolean
  isOrganizationMember: boolean
  isMediator: boolean
  organization: string | null
}

export type FeatureFlags = Omit<
  {
    [key in FeatureFlagType]: boolean
  },
  '%future added value'
>

export type IntlType = {
  locale: Locale
  messages: {
    [key: string]: string
  }
}

export type Locales = keyof Omit<Record<TranslationLocale, TranslationLocale>, '%future added value'>

export type Translations<Fields extends string> = {
  [key in keyof {
    [Locale in Locales as `${Locale}-${Fields}`]?: string | null
  }]: string
}

// https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> }
