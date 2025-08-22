import { metadataStepQuery$data } from '@relay/metadataStepQuery.graphql'
import { removeAccents } from '@shared/utils/removeAccents'
import Fetcher from '@utils/fetch'
import { Metadata } from 'next'
import { graphql } from 'relay-runtime'

export const STEP_METADATA_QUERY = graphql`
  query metadataStepQuery($slug: String!, $projectSlug: String) {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    step: nodeSlug(entity: STEP, slug: $slug, projectSlug: $projectSlug) {
      ... on Step {
        label
        metaDescription
        project {
          title
          cover {
            url
          }
        }
      }
    }
  }
`

export type Params = { params: { stepSlug: string; projectSlug: string } }

/** Works with all step types - to use everytime */
export const getStepPageMetadata = async function ({ params }: Params): Promise<Metadata> {
  const { stepSlug, projectSlug: ps } = params

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { siteTitle, step } = await Fetcher.ssrGraphql<metadataStepQuery$data>(STEP_METADATA_QUERY, {
    slug,
    projectSlug,
  })

  const baseTitle = siteTitle?.value ?? 'Cap Collectif'

  if (!step)
    return {
      title: `${baseTitle}`,
    }

  const { label, metaDescription, project } = step
  const { title, cover } = project

  const metaTitle = `${title} - ${label}`

  const openGraph = cover?.url
    ? {
        images: [cover?.url],
      }
    : null

  return {
    title: `${baseTitle} - ${metaTitle}`,
    description: metaDescription,
    openGraph,
  }
}
