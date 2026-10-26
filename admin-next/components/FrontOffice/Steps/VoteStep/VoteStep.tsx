'use client'

import { pageProjectStepMetadataQuery$data } from '@relay/pageProjectStepMetadataQuery.graphql'
import { VoteStepQuery } from '@relay/VoteStepQuery.graphql'
import { VoteStepHeroQuery } from '@relay/VoteStepHeroQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE } from '@shared/utils/cookies'
import { useCookies } from 'next-client-cookies'
import { parseAsString, useQueryStates } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useLazyLoadQuery } from 'react-relay'
import { LeafletStyles } from 'src/app/styles'
import { buildVoteStepQueryVariables, VOTE_STEP_HERO_QUERY, VOTE_STEP_QUERY } from './VoteStep.queries'
import VoteStepWebLayout from './VoteStepWebLayout'
import VoteStepHeroSection from './VoteStepHeroSection'
import { VoteStepProjectHeroSkeleton, VoteStepWebLayoutSkeleton } from './VoteStepWebLayoutSkeleton'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

export const VoteStepWeb: React.FC<{
  customCode?: string
  defaultSort?: string | null
  projectCustomCode?: string
  token: string
  stepId: string
}> = ({ stepId, customCode, defaultSort, projectCustomCode }) => {
  const { viewerSession } = useAppContext()

  const sortDefault = defaultSort?.toLowerCase() ?? 'random'

  const [filters] = useQueryStates(
    {
      sort: parseAsString.withDefault(sortDefault),
      category: parseAsString.withDefault('ALL'),
      theme: parseAsString.withDefault('ALL'),
      status: parseAsString.withDefault('ALL'),
      userType: parseAsString.withDefault('ALL'),
      district: parseAsString.withDefault('ALL'),
      term: parseAsString,
    },
    { history: 'push' },
  )

  const variables = React.useMemo(
    () =>
      buildVoteStepQueryVariables({
        stepId,
        isAuthenticated: viewerSession !== null,
        searchParams: filters,
      }) as VoteStepQuery['variables'],
    [stepId, viewerSession, filters],
  )
  const data = useLazyLoadQuery<VoteStepQuery>(VOTE_STEP_QUERY, variables)

  if (!data) return null

  const { step } = data

  return <VoteStepWebLayout step={step} customCode={customCode} projectCustomCode={projectCustomCode} />
}

const VoteStepHero: React.FC<{ stepId: string }> = ({ stepId }) => {
  const data = useLazyLoadQuery<VoteStepHeroQuery>(VOTE_STEP_HERO_QUERY, { stepId })

  return data.step ? <VoteStepHeroSection step={data.step} /> : null
}

export const VoteStep: React.FC<{
  customCode?: string
  projectCustomCode?: string
  prefetchedStep: pageProjectStepMetadataQuery$data['step']
}> = ({ prefetchedStep, customCode, projectCustomCode }) => {
  const new_new_vote_step = useFeatureFlag('new_new_vote_step')
  const { setBreadCrumbItems } = useNavBarContext()
  const { project, label, form, __typename, defaultSort } = prefetchedStep
  const cookies = useCookies()
  const intl = useIntl()
  const token = cookies.get(ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE)
    ? JSON.parse(atob(cookies.get(ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE)))
    : null

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

  if (!new_new_vote_step) {
    return <p>new_new_vote_step feature toggle must be enabled</p>
  }

  return (
    <>
      {hasMapView ? <LeafletStyles /> : null}
      <React.Suspense fallback={<VoteStepProjectHeroSkeleton />}>
        <VoteStepHero stepId={prefetchedStep.id} />
      </React.Suspense>
      <React.Suspense fallback={<VoteStepWebLayoutSkeleton hasMapView={hasMapView} />}>
        <VoteStepWeb
          stepId={prefetchedStep.id}
          token={token}
          customCode={customCode}
          defaultSort={defaultSort}
          projectCustomCode={projectCustomCode}
        />
      </React.Suspense>
    </>
  )
}

export default VoteStep
