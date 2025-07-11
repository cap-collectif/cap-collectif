import { Metadata } from 'next'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { pageContactMetadataQuery$data } from '@relay/pageContactMetadataQuery.graphql'
import { pageContactContentQuery$data } from '@relay/pageContactContentQuery.graphql'
import Contact from './Contact'

const METADATA_QUERY = graphql`
  query pageContactMetadataQuery {
    title: siteParameter(keyname: "global.site.fullname") {
      value
    }
    contactPageTitle: siteParameter(keyname: "contact.title") {
      value
    }
    metaDescription: siteParameter(keyname: "contact.metadescription") {
      value
    }
    media: siteImage(keyname: "contact.picto") {
      media {
        url(format: "relative")
      }
    }
  }
`

export async function generateMetadata(): Promise<Metadata> {
  const { title, metaDescription, media, contactPageTitle } = await Fetcher.ssrGraphql<pageContactMetadataQuery$data>(
    METADATA_QUERY,
    {},
  )

  const baseTitle = title?.value ?? 'Cap Collectif'

  const openGraph = media?.media?.url
    ? {
        images: [media?.media?.url],
      }
    : null

  return {
    title: `${baseTitle}${contactPageTitle ? ` - ${contactPageTitle.value}` : ''}`,
    description: metaDescription?.value,
    openGraph,
  }
}

const QUERY = graphql`
  query pageContactContentQuery {
    contactPageTitle: siteParameter(keyname: "contact.title") {
      value
    }
    customCode: siteParameter(keyname: "contact.customcode") {
      value
    }
    description: siteParameter(keyname: "contact.content.body") {
      value
    }
    contactForms {
      id
      title
      body
      confidentiality
    }
  }
`

export default async function Page() {
  const data = await Fetcher.ssrGraphql<pageContactContentQuery$data>(QUERY, {})

  return (
    <>
      {data?.customCode ? (
        <div id="contact-page-code" dangerouslySetInnerHTML={{ __html: data?.customCode?.value }} />
      ) : null}
      <main id="contact-page">
        <Contact data={data} />
      </main>
    </>
  )
}
