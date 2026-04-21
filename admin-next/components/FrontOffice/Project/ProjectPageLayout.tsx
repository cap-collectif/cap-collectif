'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Box, Flex } from '@cap-collectif/ui'
import { ProjectPageLayout_project$key } from '@relay/ProjectPageLayout_project.graphql'
import { ProjectPageLayout_query$key } from '@relay/ProjectPageLayout_query.graphql'
import ProjectPageHero from './ProjectPageHero'
import ProjectPageTabBar from './ProjectPageTabBar'
import ProjectPageCustomTab from './ProjectPageCustomTab'
import ProjectPagePostsTab from './ProjectPagePostsTab'
import ProjectPageEventsTab from './ProjectPageEventsTab'
import ProjectPageTabsMobile from './ProjectPageTabsMobile'
import { useQueryState } from 'nuqs'
import ParticipationSteps from './ParticipationSteps'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  project: ProjectPageLayout_project$key
  query: ProjectPageLayout_query$key
}

const FRAGMENT = graphql`
  fragment ProjectPageLayout_project on Project {
    id
    title
    tabs {
      id
      slug
      enabled
      ... on ProjectTabNews {
        news {
          id
        }
      }
      ... on ProjectTabEvents {
        events {
          id
        }
      }
    }
    ...ProjectPageHero_project
    ...ProjectPageTabBar_project
    ...ProjectPageCustomTab_project
    ...ProjectPageTabsMobile_project
    ...ProjectPageEventsTab_project
    ...ProjectPagePostsTab_project
    ...ParticipationSteps_project
  }
`

const QUERY_FRAGMENT = graphql`
  fragment ProjectPageLayout_query on Query {
    ...ProjectPageHero_query
  }
`

const isTabVisible = (tab: { enabled: boolean; news?: ReadonlyArray<unknown>; events?: ReadonlyArray<unknown> }) => {
  if (!tab.enabled) return false
  if (tab.news !== undefined) return tab.news.length > 0
  if (tab.events !== undefined) return tab.events.length > 0
  return true
}

// Refonte page projet (#19461)
const ProjectPageLayout: React.FC<Props> = ({ project, query: queryKey }) => {
  const data = useFragment(FRAGMENT, project)
  const queryData = useFragment(QUERY_FRAGMENT, queryKey)

  const visibleTabs = data.tabs.filter(isTabVisible)
  const firstTabId = visibleTabs[0]?.id ?? ''

  const [activeSlug, setActiveSlug] = useQueryState('tab')
  const activeTabId = activeSlug ? visibleTabs.find(t => t.slug === activeSlug)?.id ?? firstTabId : firstTabId

  const renderTabContent = () => {
    const activeTabData = visibleTabs.find(t => t.id === activeTabId)
    if (activeTabData?.news !== undefined) return <ProjectPagePostsTab project={data} />
    if (activeTabData?.events !== undefined) return <ProjectPageEventsTab project={data} />
    return <ProjectPageCustomTab project={data} activeTab={activeTabId} />
  }

  return (
    <Box>
      <ProjectPageHero project={data} query={queryData} />
      {/* Desktop: sticky tab bar + tab content */}
      <Box display={['none', 'block']}>
        <Flex gap="xl" alignItems="flex-start" maxWidth={pxToRem(1280)} width="100%" margin="auto" px="lg">
          <Box flex="1">
            <ProjectPageTabBar
              project={data}
              activeTab={activeSlug ?? visibleTabs[0]?.slug ?? ''}
              onTabChange={slug => setActiveSlug(slug)}
            />
            {renderTabContent()}
          </Box>
          <ParticipationSteps project={data} />
        </Flex>
      </Box>
      {/* Mobile: sections as panels with "View more" modals */}
      <Box display={['block', 'none']}>
        <ParticipationSteps project={data} />
        <ProjectPageTabsMobile project={data} />
      </Box>
    </Box>
  )
}

export default ProjectPageLayout
