import { graphql } from 'relay-runtime'
import Organization from './Organization'
import Fetcher from '@utils/fetch'
import { Metadata, ResolvedMetadata } from 'next'
import { pageOrganizationMetadataQuery$data } from '@relay/pageOrganizationMetadataQuery.graphql'

const METADATA_QUERY = graphql`
  query pageOrganizationMetadataQuery($organizationSlug: String!) {
    organization: nodeSlug(entity: ORGANIZATION, slug: $organizationSlug) {
      ... on Organization {
        title
        body
        media {
          url(format: "reference")
        }
      }
    }
  }
`

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params, parent: ResolvedMetadata): Promise<Metadata> {
  const slug = (await params).slug
  const { organization } = await Fetcher.ssrGraphql<pageOrganizationMetadataQuery$data>(METADATA_QUERY, {
    organizationSlug: slug,
  })

  const baseTitle = (await parent).title ?? 'Cap Collectif'

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

export default function Page({ params }: Params) {
  const { slug } = params

  if (!slug) return null

  return (
    <main id="organization-page">
      <Organization slug={slug} />
    </main>
  )
}
