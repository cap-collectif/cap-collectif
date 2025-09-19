import { Metadata } from 'next'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { pageProjectsMetadataQuery$data } from '@relay/pageProjectsMetadataQuery.graphql'
import Posts from './Posts'

const METADATA_QUERY = graphql`
  query pagePostsMetadataQuery {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    pageTitle: siteParameter(keyname: "blog.jumbotron.title") {
      value
    }
    description: siteParameter(keyname: "blog.metadescription") {
      value
    }
    customCode: siteParameter(keyname: "blog.customcode") {
      value
    }
    body: siteParameter(keyname: "blog.jumbotron.body") {
      value
    }
    secondaryBody: siteParameter(keyname: "blog.content.body") {
      value
    }
    pagination: siteParameter(keyname: "blog.pagination.size") {
      value
    }
    siteImage(keyname: "blog.picto") {
      media {
        url
      }
    }
  }
`

export async function generateMetadata(): Promise<Metadata> {
  const { pageTitle, siteTitle, description, siteImage } = await Fetcher.ssrGraphql<pageProjectsMetadataQuery$data>(
    METADATA_QUERY,
    {},
  )
  const baseTitle = siteTitle?.value ?? 'Cap Collectif'

  const openGraph = siteImage?.media?.url
    ? {
        images: [siteImage?.media?.url],
      }
    : null

  return {
    title: `${baseTitle}${pageTitle ? ` - ${pageTitle.value}` : ''}`,
    description: description?.value,
    openGraph,
  }
}

export default async function Page() {
  const { customCode, pageTitle, body, secondaryBody, pagination } =
    await Fetcher.ssrGraphql<pageProjectsMetadataQuery$data>(METADATA_QUERY, {})
  const bodyValue = body?.value
  const secBodyValue = secondaryBody?.value

  // This should be temporary until the back office page is reworked and the 2 fields are merged
  const newsPageBody = `${bodyValue || ''}${secBodyValue ? `${bodyValue ? '<br/><br/>' : ''}${secBodyValue}` : ''}`

  return (
    <>
      {customCode ? (
        <div id="news-page-code" className="cap-custom-code" dangerouslySetInnerHTML={{ __html: customCode?.value }} />
      ) : null}
      <main role="main" id="news-page">
        <Posts
          title={pageTitle?.value}
          customCode={customCode?.value}
          body={newsPageBody}
          pagination={Number(pagination?.value)}
        />
      </main>
    </>
  )
}
