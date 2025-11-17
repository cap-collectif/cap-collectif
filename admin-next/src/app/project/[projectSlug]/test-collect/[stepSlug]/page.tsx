/* eslint-disable relay/unused-fields */
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { Metadata } from 'next'
import { pageProjectStepMetadataQuery$data } from '@relay/pageProjectStepMetadataQuery.graphql'
import { notFound } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'
import VoteStep from '@components/FrontOffice/Steps/VoteStep/VoteStep'
import ProjectShowTrash from '@components/FrontOffice/ProjectTrash/ProjectShowTrash'

export const COLLECT_SELECTION_STEP_METADATA_QUERY = graphql`
  query pageProjectStepMetadataQuery($slug: String!, $projectSlug: String) {
    siteTitle: siteParameter(keyname: "global.site.fullname") {
      value
    }
    step: nodeSlug(entity: STEP, slug: $slug, projectSlug: $projectSlug) {
      ... on ProposalStep {
        __typename
        label
        metaDescription
        votable
        form {
          contribuable
          isMapViewEnabled
        }
        project {
          cover {
            url
          }
          title
          url
          firstCollectStep {
            form {
              isMapViewEnabled
            }
          }
        }
        id
        customCode
      }
    }
  }
`

type Params = { params: { stepSlug: string; projectSlug: string } }

export const getCollectAndSelectionStepPageMetadata = async function ({ params }: Params): Promise<Metadata> {
  const { stepSlug, projectSlug: ps } = params

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { siteTitle, step } = await Fetcher.ssrGraphql<pageProjectStepMetadataQuery$data>(
    COLLECT_SELECTION_STEP_METADATA_QUERY,
    {
      slug,
      projectSlug,
    },
  )

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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return getCollectAndSelectionStepPageMetadata({ params })
}

export const getCollectAndSelectionStepPage = async ({ params }: Params) => {
  const { stepSlug, projectSlug: ps } = params

  if (!stepSlug) return notFound()

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { step } = await Fetcher.ssrGraphql<pageProjectStepMetadataQuery$data>(COLLECT_SELECTION_STEP_METADATA_QUERY, {
    slug,
    projectSlug,
  })

  if (!step) return notFound()

  return (
    <>
      {step?.customCode ? (
        <div id="step-page-code" className="cap-custom-code" dangerouslySetInnerHTML={{ __html: step?.customCode }} />
      ) : null}
      <section id={`vote-step-page-${step?.id}`}>
        <VoteStep stepSlug={stepSlug} projectSlug={projectSlug} prefetchedStep={step} customCode={step.customCode} />
      </section>
      <ProjectShowTrash projectSlug={projectSlug} />
    </>
  )
}

export default async function Page({ params }: Params) {
  return getCollectAndSelectionStepPage({ params })
}
