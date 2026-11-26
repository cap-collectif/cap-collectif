/* eslint-disable relay/unused-fields */
import { cache } from 'react'
import { graphql } from 'relay-runtime'
import { Metadata } from 'next'
import { pageProjectStepMetadataQuery$data } from '@relay/pageProjectStepMetadataQuery.graphql'
import { pageProjectStepAccessQuery$data } from '@relay/pageProjectStepAccessQuery.graphql'
import { notFound } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'
import VoteStep from '@components/FrontOffice/Steps/VoteStep/VoteStep'
import ProjectShowTrash from '@components/FrontOffice/ProjectTrash/ProjectShowTrash'
import ProjectAccessDenied from '@components/FrontOffice/Project/ProjectAccessDenied'
import { ssrGraphqlWithLocale } from '../../../../server/ssr-graphql-with-locale'
import { getRequestLocale } from '../../../../server/request-locale'
import { messages } from '@utils/withPageAuthRequired'

const COLLECT_SELECTION_STEP_METADATA_QUERY = graphql`
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
        defaultSort
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
          customCode
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

// `nodeSlug` does not check the viewer's permissions, whereas `node` returns null when the viewer
// cannot see the step: the page then reproduces the legacy access-denied pages.
const COLLECT_SELECTION_STEP_ACCESS_QUERY = graphql`
  query pageProjectStepAccessQuery($stepId: ID!) {
    isAuthenticated
    step: node(id: $stepId) {
      id
    }
  }
`

// Cached per request, so that the metadata and the page share a single access check.
const getStepAccess = cache(async (stepId: string) => {
  const data = await ssrGraphqlWithLocale<pageProjectStepAccessQuery$data>(COLLECT_SELECTION_STEP_ACCESS_QUERY, {
    stepId,
  })

  return {
    viewerCanSeeStep: !!data?.step,
    isAuthenticated: !!data?.isAuthenticated,
  }
})

type Params = { params: { stepSlug: string; projectSlug: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { stepSlug, projectSlug: ps } = params

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { siteTitle, step } = await ssrGraphqlWithLocale<pageProjectStepMetadataQuery$data>(
    COLLECT_SELECTION_STEP_METADATA_QUERY,
    {
      slug,
      projectSlug,
    },
  )

  const baseTitle = siteTitle?.value ?? 'Cap Collectif'

  if (!step?.id)
    return {
      title: `${baseTitle}`,
    }

  const { viewerCanSeeStep } = await getStepAccess(step.id)

  // Do not expose a private project's title and description to a viewer who cannot see it,
  // but keep a page title that tells the viewer why the page is empty.
  if (!viewerCanSeeStep) {
    const unauthorizedAccess = messages[getRequestLocale()]?.['unauthorized-access'] ?? 'unauthorized-access'

    return {
      title: `${baseTitle} - ${unauthorizedAccess}`,
    }
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

export default async function Page({ params }: Params) {
  const { stepSlug, projectSlug: ps } = params

  if (!stepSlug) return notFound()

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { step } = await ssrGraphqlWithLocale<pageProjectStepMetadataQuery$data>(
    COLLECT_SELECTION_STEP_METADATA_QUERY,
    {
      slug,
      projectSlug,
    },
  )

  if (!step?.id) return notFound()

  const { viewerCanSeeStep, isAuthenticated } = await getStepAccess(step.id)

  if (!viewerCanSeeStep) return <ProjectAccessDenied isAuthenticated={isAuthenticated} />

  return (
    <>
      {step?.customCode ? (
        <div id="step-page-code" className="cap-custom-code" dangerouslySetInnerHTML={{ __html: step?.customCode }} />
      ) : null}
      {step?.project?.customCode ? (
        <div
          id="project-page-code"
          className="cap-custom-code"
          dangerouslySetInnerHTML={{ __html: step.project.customCode }}
        />
      ) : null}
      <section id={`vote-step-page-${step?.id}`}>
        <VoteStep prefetchedStep={step} customCode={step.customCode} projectCustomCode={step.project?.customCode} />
      </section>
      <ProjectShowTrash projectSlug={projectSlug} />
    </>
  )
}
