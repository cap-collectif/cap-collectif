export const CONNECTION_NODES_PER_PAGE = 20

type Translation = { readonly locale: string; readonly title: string | null; readonly link: string | null }

// The translation in the admin interface locale, or the first available one
export const getTranslation = <T extends Translation>(translations: ReadonlyArray<T>, locale: string): T | undefined =>
  translations.find(translation => translation.locale === locale) ?? translations[0]

export const getTitleFieldName = (code: string) => `${code}-title`
export const getLinkFieldName = (code: string) => `${code}-link`
