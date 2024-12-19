import { Metadata, ResolvedMetadata } from 'next'
import District from './District'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { pageDistrictMetadataQuery$data } from '@relay/pageDistrictMetadataQuery.graphql'

const METADATA_QUERY = graphql`
  query pageDistrictMetadataQuery($districtSlug: String!) {
    district: nodeSlug(entity: DISTRICT, slug: $districtSlug) {
      ... on GlobalDistrict {
        name
        description
        cover {
          url(format: "reference")
        }
      }
    }
  }
`

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params, parent: ResolvedMetadata): Promise<Metadata> {
  const slug = (await params).slug
  const { district } = await Fetcher.ssrGraphql<pageDistrictMetadataQuery$data>(METADATA_QUERY, {
    districtSlug: slug,
  })

  const baseTitle = (await parent).title ?? 'Cap Collectif'

  if (!district)
    return {
      title: `${baseTitle}`,
    }

  const { name, description, cover } = district

  const openGraph = cover?.url
    ? {
        images: [cover?.url],
      }
    : null

  return {
    title: `${baseTitle}${name ? ` - ${name}` : ''}`,
    description,
    openGraph,
  }
}

export default function Page({ params }: Params) {
  const { slug } = params

  if (!slug) return null

  return (
    <main id="district-page">
      <District slug={slug} />
    </main>
  )
}
