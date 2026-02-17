import { graphql } from 'relay-runtime'
import { Metadata } from 'next'
import { pagePageMetadataQuery$data } from '@relay/pagePageMetadataQuery.graphql'
import PageRender from './PageRender'
import { notFound } from 'next/navigation'
import { messages } from '@utils/withPageAuthRequired'
import { pagePageCharteQuery$data } from '@relay/pagePageCharteQuery.graphql'
import { formatCodeToLocale, formatLocaleToCode } from '@utils/locale-helper'
import { removeAccents } from '@shared/utils/removeAccents'
import { Locale } from 'types'
import { getRequestLocale } from '../../server/request-locale'
import { ssrGraphqlWithLocale } from '../../server/ssr-graphql-with-locale'

const METADATA_QUERY = graphql`
  query pagePageMetadataQuery($pageSlug: String!, $locale: TranslationLocale) {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    page: nodeSlug(entity: PAGE, slug: $pageSlug) {
      ... on Page {
        media {
          url(format: "reference")
        }
        customCode
        title(locale: $locale)
        body(locale: $locale)
        translations {
          locale
          title
          body
          metaDescription
        }
        translationBySlug(slug: $pageSlug) {
          title
          metaDescription
          body
        }
      }
    }
  }
`

const CHARTE_QUERY = graphql`
  query pagePageCharteQuery {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    charter: siteParameter(keyname: "charter.body") {
      value
    }
    locales {
      code
      isDefault
    }
  }
`

const getCharterSlugs = () => {
  const messageKeys = Object.keys(messages)
  return messageKeys?.map(key => encodeURI(messages[key]['charter'])?.toLowerCase())
}

const normalizeLocaleCode = (value?: string | null): string => (value || '').replace(/-/g, '_').toLowerCase()

const getPageTranslationForLocale = (
  translations:
    | ReadonlyArray<{
        readonly locale: string
        readonly title: string | null
        readonly body: string | null
        readonly metaDescription: string | null
      }>
    | undefined
    | null,
  locale: Locale,
) => {
  const expectedLocale = normalizeLocaleCode(formatLocaleToCode(locale))
  return translations?.find(translation => normalizeLocaleCode(translation.locale) === expectedLocale) ?? null
}

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const requestLocale = getRequestLocale()
  const initialSlug = (await params).slug
  const slug = removeAccents(decodeURI(initialSlug))

  const charterSlugs = getCharterSlugs()

  if (charterSlugs?.includes(slug)) {
    const { locales, siteTitle } = await ssrGraphqlWithLocale<pagePageCharteQuery$data>(
      CHARTE_QUERY,
      {},
      { locale: requestLocale },
    )

    const baseTitle = siteTitle?.value ?? 'Cap Collectif'

    const title = messages[requestLocale || formatCodeToLocale(locales.find(l => l.isDefault)?.code) || 'fr-FR']
      ?.charter
    return {
      title: `${baseTitle}${title ? ` - ${title}` : ''}`,
    }
  }

  const { page, siteTitle } = await ssrGraphqlWithLocale<pagePageMetadataQuery$data>(
    METADATA_QUERY,
    {
      pageSlug: slug,
      locale: formatLocaleToCode(requestLocale),
    },
    { locale: requestLocale },
  )

  const baseTitle = siteTitle?.value ?? 'Cap Collectif'

  if (!page)
    return {
      title: `${baseTitle}`,
    }

  const localizedTranslation = getPageTranslationForLocale(page.translations, requestLocale)
  // When a page is accessed via a localized slug (e.g. /pages/faq-en), the slug translation is authoritative.
  const title = page.translationBySlug?.title || localizedTranslation?.title || page.title
  const metaDescription = page.translationBySlug?.metaDescription || localizedTranslation?.metaDescription
  const { media } = page

  const openGraph = media?.url
    ? {
        images: [media?.url],
      }
    : null

  return {
    title: `${baseTitle}${title ? ` - ${title}` : ''}`,
    description: metaDescription,
    openGraph,
  }
}

export default async function Page({ params }: Params) {
  const requestLocale = getRequestLocale()
  const { slug: initialSlug } = params
  const charterSlugs = getCharterSlugs()

  if (!initialSlug) return notFound()

  const slug = removeAccents(decodeURI(initialSlug))

  if (!slug) return notFound()

  if (charterSlugs?.includes(slug)) {
    const { charter, locales } = await ssrGraphqlWithLocale<pagePageCharteQuery$data>(
      CHARTE_QUERY,
      {},
      { locale: requestLocale },
    )
    if (!charter?.value) return notFound()
    const title = messages[
      requestLocale || formatCodeToLocale(locales.find(l => l.isDefault)?.code) || Locale.frFR
    ]?.charter

    return (
      <main role="main" id="charter-page">
        <PageRender title={title || 'Charte'} body={charter?.value} />
      </main>
    )
  }

  const { page } = await ssrGraphqlWithLocale<pagePageMetadataQuery$data>(
    METADATA_QUERY,
    {
      pageSlug: slug,
      locale: formatLocaleToCode(requestLocale),
    },
    { locale: requestLocale },
  )

  if (!page) return notFound()

  const { translationBySlug, customCode } = page
  const localizedTranslation = getPageTranslationForLocale(page.translations, requestLocale)
  // Keep slug-driven content consistent regardless of stale locale cookie.
  const title = translationBySlug?.title || localizedTranslation?.title || page.title
  const body = translationBySlug?.body || localizedTranslation?.body || page.body

  if (!title || !body) return notFound()

  return (
    <>
      {customCode ? (
        <div id="custom-page-code" className="cap-custom-code" dangerouslySetInnerHTML={{ __html: customCode }} />
      ) : null}
      <main role="main" id="custom-page">
        <PageRender title={title} body={body} customCode={customCode} />
      </main>
    </>
  )
}
