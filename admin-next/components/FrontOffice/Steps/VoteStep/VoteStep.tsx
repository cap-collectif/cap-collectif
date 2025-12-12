'use client'

import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useCookies } from 'next-client-cookies'
import { useIntl } from 'react-intl'
import { VoteStepQuery } from '@relay/VoteStepQuery.graphql'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE } from '@shared/utils/cookies'
import VoteStepWebLayout from './VoteStepWebLayout'
import { pageProjectStepMetadataQuery$data } from '@relay/pageProjectStepMetadataQuery.graphql'
import { evalCustomCode } from 'src/app/custom-code'
import { LeafletStyles } from 'src/app/styles'
import { getOrderByArgs } from './utils'
import VoteStepWebLayoutSkeleton from './VoteStepWebLayoutSkeleton'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useQueryState } from 'nuqs'

type Props = {
  stepSlug: string
  projectSlug: string
}

const QUERY = graphql`
  query VoteStepQuery($stepSlug: String!, $projectSlug: String!, $term: String, $orderBy: [ProposalOrder]) {
    step: nodeSlug(entity: STEP, slug: $stepSlug, projectSlug: $projectSlug) {
      ... on ProposalStep {
        ...VoteStepWebLayout_proposalStep @arguments(count: 50, term: $term, orderBy: $orderBy)
      }
    }
  }
`

export const VoteStepWeb: React.FC<Props & { token: string }> = ({ stepSlug, projectSlug }) => {
  const [term] = useQueryState('term')
  const [sort] = useQueryState('sort')

  const data = useLazyLoadQuery<VoteStepQuery>(QUERY, {
    stepSlug,
    projectSlug,
    // token, for now
    term,
    orderBy: getOrderByArgs(sort) || [
      {
        field: 'RANDOM',
        direction: 'ASC',
      },
    ],
  })

  if (!data) return null

  const { step } = data

  return (
    <React.Suspense>
      <VoteStepWebLayout step={step} />
    </React.Suspense>
  )
}

export const VoteStep: React.FC<
  Props & { customCode?: string; prefetchedStep: pageProjectStepMetadataQuery$data['step'] }
> = ({ stepSlug, projectSlug, prefetchedStep, customCode }) => {
  const new_new_vote_step = useFeatureFlag('new_new_vote_step')

  if (!new_new_vote_step) {
    return <p>new_new_vote_step feature toggle must be enabled</p>
  }

  const { setBreadCrumbItems } = useNavBarContext()
  const { project, label, form, __typename } = prefetchedStep
  const cookies = useCookies()
  const intl = useIntl()
  const token = cookies.get(ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE)
    ? JSON.parse(atob(cookies.get(ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE)))
    : null

  React.useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  React.useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: project.title, href: project.url || '' },
      { title: label, href: '' },
    ])
  }, [setBreadCrumbItems, intl, label, project])

  const hasMapView =
    __typename === 'CollectStep' ? form?.isMapViewEnabled : project?.firstCollectStep?.form?.isMapViewEnabled

  return (
    <>
      {hasMapView ? <LeafletStyles /> : null}
      <React.Suspense fallback={<VoteStepWebLayoutSkeleton hasMapView={hasMapView} />}>
        <VoteStepWeb stepSlug={stepSlug} projectSlug={projectSlug} token={token} />
      </React.Suspense>
    </>
  )
}

export default VoteStep
