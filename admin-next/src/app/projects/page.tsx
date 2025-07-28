import { Metadata } from 'next'
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { pageProjectsMetadataQuery$data } from '@relay/pageProjectsMetadataQuery.graphql'
import Projects from './Projects'

const METADATA_QUERY = graphql`
  query pageProjectsMetadataQuery {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    pageTitle: siteParameter(keyname: "projects.jumbotron.title") {
      value
    }
    description: siteParameter(keyname: "projects.metadescription") {
      value
    }
    customCode: siteParameter(keyname: "projects.customcode") {
      value
    }
    body: siteParameter(keyname: "projects.jumbotron.body") {
      value
    }
    secondaryBody: siteParameter(keyname: "projects.content.body") {
      value
    }
    pagination: siteParameter(keyname: "projects.pagination") {
      value
    }
    siteImage(keyname: "projects.picto") {
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

  const title = pageTitle?.value ?? siteTitle?.value ?? 'Cap Collectif'

  const openGraph = siteImage?.media?.url
    ? {
        images: [siteImage?.media?.url],
      }
    : null

  return {
    title: title,
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
  const projectsPageBody = `${bodyValue || ''}${secBodyValue ? `${bodyValue ? '<br/><br/>' : ''}${secBodyValue}` : ''}`

  return (
    <>
      {customCode ? (
        <div
          id="projects-page-code"
          className="cap-custom-code"
          dangerouslySetInnerHTML={{ __html: customCode?.value }}
        />
      ) : null}
      <main id="projects-page">
        <Projects
          title={pageTitle?.value}
          customCode={customCode?.value}
          body={projectsPageBody}
          pagination={Number(pagination?.value)}
        />
      </main>
    </>
  )
}
