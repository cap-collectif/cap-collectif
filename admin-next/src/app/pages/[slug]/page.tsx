import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { Metadata, ResolvedMetadata } from 'next'
import { pagePageMetadataQuery$data } from '@relay/pagePageMetadataQuery.graphql'
import PageRender from './PageRender'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { messages } from '@utils/withPageAuthRequired'
import { pagePageCharteQuery$data } from '@relay/pagePageCharteQuery.graphql'
import { formatCodeToLocale } from '@utils/locale-helper'
import { formatCookiesForServer } from '@shared/utils/cookies'
import { removeAccents } from '@shared/utils/removeAccents'

const METADATA_QUERY = graphql`
  query pagePageMetadataQuery($pageSlug: String!) {
    page: nodeSlug(entity: PAGE, slug: $pageSlug) {
      ... on Page {
        media {
          url(format: "reference")
        }
        customCode
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

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params, parent: ResolvedMetadata): Promise<Metadata> {
  const cookieStore = cookies()
  const initialSlug = (await params).slug
  const slug = removeAccents(decodeURI(initialSlug))
  const baseTitle = (await parent).title ?? 'Cap Collectif'
  const charterSlugs = getCharterSlugs()

  if (charterSlugs?.includes(slug)) {
    const locale = cookieStore.get('locale')?.value
    const { locales } = await Fetcher.ssrGraphql<pagePageCharteQuery$data>(
      CHARTE_QUERY,
      {},
      formatCookiesForServer(cookieStore),
    )

    const title = messages[locale || formatCodeToLocale(locales.find(l => l.isDefault)?.code) || 'fr-FR']?.charter
    return {
      title: `${baseTitle}${title ? ` - ${title}` : ''}`,
    }
  }

  const { page } = await Fetcher.ssrGraphql<pagePageMetadataQuery$data>(METADATA_QUERY, {
    pageSlug: slug,
  })

  if (!page)
    return {
      title: `${baseTitle}`,
    }

  const { media, translationBySlug } = page
  const { title, metaDescription } = translationBySlug

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
  const cookieStore = cookies()
  const { slug: initialSlug } = params
  const charterSlugs = getCharterSlugs()

  if (!initialSlug) return notFound()

  const slug = removeAccents(decodeURI(initialSlug))

  if (!slug) return notFound()

  if (charterSlugs?.includes(slug)) {
    const locale = cookieStore.get('locale')?.value
    const { charter, locales } = await Fetcher.ssrGraphql<pagePageCharteQuery$data>(
      CHARTE_QUERY,
      {},
      formatCookiesForServer(cookieStore),
    )
    if (!charter?.value) return notFound()
    const title = messages[locale || formatCodeToLocale(locales.find(l => l.isDefault)?.code) || 'fr-FR']?.charter

    return (
      <main id="charter-page">
        <PageRender title={title || 'Charte'} body={charter?.value} />
      </main>
    )
  }

  const { page } = await Fetcher.ssrGraphql<pagePageMetadataQuery$data>(METADATA_QUERY, {
    pageSlug: slug,
  })

  if (!page) return notFound()

  const { translationBySlug, customCode } = page
  const { title, body } = translationBySlug

  return (
    <>
      {customCode ? <div id="custom-page-code" dangerouslySetInnerHTML={{ __html: customCode }} /> : null}
      <main id="custom-page">
        <PageRender title={title} body={body} customCode={customCode} />
      </main>
    </>
  )
}
