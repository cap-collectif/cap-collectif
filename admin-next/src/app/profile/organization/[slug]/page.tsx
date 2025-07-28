import { graphql } from 'relay-runtime'
import Organization from './Organization'
import Fetcher from '@utils/fetch'
import { Metadata } from 'next'
import { pageOrganizationMetadataQuery$data } from '@relay/pageOrganizationMetadataQuery.graphql'
import { notFound } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'

const METADATA_QUERY = graphql`
  query pageOrganizationMetadataQuery($organizationSlug: String!) {
    title: siteParameter(keyname: "global.site.fullname") {
      value
    }
    organization: nodeSlug(entity: ORGANIZATION, slug: $organizationSlug) {
      ... on Organization {
        title
        body
        media {
          url(format: "relative")
        }
        banner {
          url(format: "relative")
        }
        socialNetworks {
          webPageUrl
          facebookUrl
          twitterUrl
        }
      }
    }
  }
`

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const initialSlug = (await params).slug

  const slug = removeAccents(decodeURI(initialSlug))

  const { organization, title: siteTitle } = await Fetcher.ssrGraphql<pageOrganizationMetadataQuery$data>(
    METADATA_QUERY,
    {
      organizationSlug: slug,
    },
  )

  const baseTitle = siteTitle?.value ?? 'Cap Collectif'

  if (!organization)
    return {
      title: `${baseTitle}`,
    }

  const { title, body, media } = organization

  const openGraph = media?.url
    ? {
        images: [media?.url],
      }
    : null

  return {
    title: `${baseTitle}${title ? ` - ${title}` : ''}`,
    description: body,
    openGraph,
  }
}

export default async function Page({ params }: Params) {
  const { slug: initialSlug } = params

  if (!initialSlug) return notFound()

  const slug = removeAccents(decodeURI(initialSlug))

  const { organization } = await Fetcher.ssrGraphql<pageOrganizationMetadataQuery$data>(METADATA_QUERY, {
    organizationSlug: slug,
  })

  if (!organization) return notFound()

  return (
    <main id="organization-page">
      <Organization slug={slug} organization={organization} />
    </main>
  )
}
