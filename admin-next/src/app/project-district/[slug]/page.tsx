import { Metadata } from 'next'
import District from './District'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { pageDistrictMetadataQuery$data } from '@relay/pageDistrictMetadataQuery.graphql'
import { notFound } from 'next/navigation'

const METADATA_QUERY = graphql`
  query pageDistrictMetadataQuery($districtSlug: String!) {
    title: siteParameter(keyname: "global.site.fullname") {
      value
    }
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = (await params).slug
  const { district, title } = await Fetcher.ssrGraphql<pageDistrictMetadataQuery$data>(METADATA_QUERY, {
    districtSlug: slug,
  })

  const baseTitle = title?.value ?? 'Cap Collectif'

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

  if (!slug) return notFound()

  return (
    <main id="district-page">
      <District slug={slug} />
    </main>
  )
}
