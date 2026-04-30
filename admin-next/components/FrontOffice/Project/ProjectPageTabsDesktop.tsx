'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageTabsDesktop_project$key } from '@relay/ProjectPageTabsDesktop_project.graphql'
import { useQueryState } from 'nuqs'
import ProjectPageTabBar from './ProjectPageTabBar'
import ProjectPageCustomTab from './ProjectPageCustomTab'
import ProjectPagePostsTab from './ProjectPagePostsTab'
import ProjectPageEventsTab from './ProjectPageEventsTab'
import { Box } from '@cap-collectif/ui'

const FRAGMENT = graphql`
  fragment ProjectPageTabsDesktop_project on Project {
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
    ...ProjectPageTabBar_project
    ...ProjectPageCustomTab_project
    ...ProjectPageEventsTab_project
    ...ProjectPagePostsTab_project
  }
`

const isTabVisible = (tab: { enabled: boolean; news?: ReadonlyArray<unknown>; events?: ReadonlyArray<unknown> }) => {
  if (!tab.enabled) return false
  if (tab.news !== undefined) return tab.news.length > 0
  if (tab.events !== undefined) return tab.events.length > 0
  return true
}

type Props = {
  project: ProjectPageTabsDesktop_project$key
}

const ProjectPageTabsDesktop: React.FC<Props> = ({ project: projectRef }) => {
  const data = useFragment(FRAGMENT, projectRef)
  const [activeSlug, setActiveSlug] = useQueryState('tab')

  const visibleTabs = data.tabs.filter(isTabVisible)

  if (visibleTabs.length === 0) return null

  const firstTabId = visibleTabs[0]?.id ?? ''
  const activeTabId = activeSlug ? visibleTabs.find(t => t.slug === activeSlug)?.id ?? firstTabId : firstTabId

  const renderTabContent = () => {
    const activeTabData = visibleTabs.find(t => t.id === activeTabId)
    if (activeTabData?.news !== undefined) return <ProjectPagePostsTab project={data} activeTab={activeTabId} />
    if (activeTabData?.events !== undefined) return <ProjectPageEventsTab project={data} activeTab={activeTabId} />
    return <ProjectPageCustomTab project={data} activeTab={activeTabId} />
  }

  return (
    <Box flex="1">
      <ProjectPageTabBar
        project={data}
        activeTab={activeSlug ?? visibleTabs[0]?.slug ?? ''}
        onTabChange={slug => setActiveSlug(slug)}
      />
      {renderTabContent()}
    </Box>
  )
}

export default ProjectPageTabsDesktop
