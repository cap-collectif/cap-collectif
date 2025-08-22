import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'
import { pageProjectCustomStepMetadataQuery$data } from '@relay/pageProjectCustomStepMetadataQuery.graphql'
import CustomStep from './CustomStep'
import { getStepPageMetadata, Params } from 'src/app/project/metadata.utils'

export const QUERY = graphql`
  query pageProjectCustomStepMetadataQuery($slug: String!, $projectSlug: String) {
    step: nodeSlug(entity: STEP, slug: $slug, projectSlug: $projectSlug) {
      ... on OtherStep {
        label
        id
        body
        customCode
        project {
          title
          url
        }
        timeRange {
          startAt
          endAt
        }
      }
    }
  }
`

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return getStepPageMetadata({ params })
}

export default async function Page({ params }: Params) {
  const { stepSlug, projectSlug: ps } = params

  if (!stepSlug) return notFound()

  const slug = removeAccents(decodeURI(stepSlug))
  const projectSlug = removeAccents(decodeURI(ps))

  const { step } = await Fetcher.ssrGraphql<pageProjectCustomStepMetadataQuery$data>(QUERY, {
    slug,
    projectSlug,
  })

  if (!step) return notFound()

  return (
    <>
      {step?.customCode ? (
        <div id="step-page-code" className="cap-custom-code" dangerouslySetInnerHTML={{ __html: step?.customCode }} />
      ) : null}
      <section id={`other-step-page-${step?.id}`}>
        <CustomStep prefetchedStep={step} />
      </section>
    </>
  )
}
