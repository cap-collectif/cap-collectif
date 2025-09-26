import { TranslationLocale } from '@relay/NavBarQuery.graphql'
import { UserTypesList_query$data } from '@relay/UserTypesList_query.graphql'
import { PlatformLocale } from '@shared/utils/platformLanguages'

export const CONNECTION_NODES_PER_PAGE = 50

type UserTypeTranslations = UserTypesList_query$data['userTypes']['edges'][number]['node']['translations'][number]

export const getExistingTranslations = (
  translations: ReadonlyArray<UserTypeTranslations> | null | undefined,
  platformLocales: Array<PlatformLocale>,
): Array<{ name: string; locale: TranslationLocale }> => {
  if (!translations) return []

  return translations
    .filter(translation => platformLocales.some(locale => locale.code === translation.locale))
    .map(translation => ({
      name: translation.name,
      locale: translation.locale,
    }))
}
