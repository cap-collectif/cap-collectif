'use client'

import { pageProjectStepMetadataQuery$data } from '@relay/pageProjectStepMetadataQuery.graphql'
import { VoteStepQuery } from '@relay/VoteStepQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE } from '@shared/utils/cookies'
import { useCookies } from 'next-client-cookies'
import { parseAsString, useQueryStates } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { evalCustomCode } from 'src/app/custom-code'
import { LeafletStyles } from 'src/app/styles'
import { getOrderByArgs } from './utils'
import VoteStepWebLayout from './VoteStepWebLayout'
import VoteStepWebLayoutSkeleton from './VoteStepWebLayoutSkeleton'

const QUERY = graphql`
  query VoteStepQuery(
    $term: String
    $orderBy: [ProposalOrder]
    $stepId: ID!
    $userType: ID
    $theme: ID
    $category: ID
    $district: ID
    $status: ID
  ) {
    step: node(id: $stepId) {
      ... on ProposalStep {
        ...VoteStepWebLayout_proposalStep
          @arguments(
            count: 50
            term: $term
            orderBy: $orderBy
            userType: $userType
            theme: $theme
            category: $category
            district: $district
            status: $status
          )
      }
    }
  }
`

export const VoteStepWeb: React.FC<{ token: string; stepId: string }> = ({ stepId }) => {
  const [filters] = useQueryStates(
    {
      sort: parseAsString.withDefault('random'),
      category: parseAsString.withDefault('ALL'),
      theme: parseAsString.withDefault('ALL'),
      status: parseAsString.withDefault('ALL'),
      userType: parseAsString.withDefault('ALL'),
      district: parseAsString.withDefault('ALL'),
      term: parseAsString,
    },
    { history: 'push' },
  )

  // Apply defaults after getting the values
  const effectiveFilters = {
    sort: filters.sort || 'random',
    category: filters.category || 'ALL',
    theme: filters.theme || 'ALL',
    status: filters.status || 'ALL',
    userType: filters.userType || 'ALL',
    district: filters.district || 'ALL',
    term: filters.term,
  }

  const data = useLazyLoadQuery<VoteStepQuery>(QUERY, {
    stepId: stepId,
    term: effectiveFilters.term || undefined,
    orderBy: getOrderByArgs(effectiveFilters.sort) || [
      {
        field: 'RANDOM',
        direction: 'ASC',
      },
    ],
    userType: effectiveFilters.userType === 'ALL' ? undefined : effectiveFilters.userType,
    theme: effectiveFilters.theme === 'ALL' ? undefined : effectiveFilters.theme,
    category: effectiveFilters.category === 'ALL' ? undefined : effectiveFilters.category,
    district: effectiveFilters.district === 'ALL' ? undefined : effectiveFilters.district,
    status: effectiveFilters.status === 'ALL' ? undefined : effectiveFilters.status,
  })

  if (!data) return null

  const { step } = data

  return (
    <React.Suspense>
      <VoteStepWebLayout step={step} />
    </React.Suspense>
  )
}

export const VoteStep: React.FC<{ customCode?: string; prefetchedStep: pageProjectStepMetadataQuery$data['step'] }> = ({
  prefetchedStep,
  customCode,
}) => {
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
        <VoteStepWeb stepId={prefetchedStep.id} token={token} />
      </React.Suspense>
    </>
  )
}

export default VoteStep
