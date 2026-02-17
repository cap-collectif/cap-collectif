import { pageHomePageMetadataQuery$data } from '@relay/pageHomePageMetadataQuery.graphql'
import { Metadata } from 'next'
import { graphql } from 'relay-runtime'
import { ssrGraphqlWithLocale } from './server/ssr-graphql-with-locale'
import Home from './Home'

export const METADATA_QUERY = graphql`
  query pageHomePageMetadataQuery {
    title: siteParameter(keyname: "global.site.fullname") {
      value
    }
    description: siteParameter(keyname: "homepage.metadescription") {
      value
    }
  }
`

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await ssrGraphqlWithLocale<pageHomePageMetadataQuery$data>(METADATA_QUERY, {})

  return {
    title: `${title?.value || 'Cap Collectif'}`,
    description: description.value,
  }
}

export default function Page() {
  return <Home />
}
