'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Box, Flex } from '@cap-collectif/ui'
import { ProjectPageLayout_project$key } from '@relay/ProjectPageLayout_project.graphql'
import { ProjectPageLayout_query$key } from '@relay/ProjectPageLayout_query.graphql'
import ProjectPageHero from './ProjectPageHero'
import ProjectPageTabsDesktop from './ProjectPageTabsDesktop'
import ProjectPageTabsMobile from './ProjectPageTabsMobile'
import ParticipationSteps from './ParticipationSteps'
import { pxToRem } from '@shared/utils/pxToRem'
import useWindowWidth from '@shared/hooks/useWindowWidth'

type Props = {
  project: ProjectPageLayout_project$key
  query: ProjectPageLayout_query$key
}

const FRAGMENT = graphql`
  fragment ProjectPageLayout_project on Project {
    ...ProjectPageHero_project
    ...ProjectPageTabsDesktop_project
    ...ProjectPageTabsMobile_project
    ...ParticipationSteps_project
  }
`

const QUERY_FRAGMENT = graphql`
  fragment ProjectPageLayout_query on Query {
    ...ProjectPageHero_query
  }
`

// Refonte page projet (#19461)
const ProjectPageLayout: React.FC<Props> = ({ project, query: queryKey }) => {
  const data = useFragment(FRAGMENT, project)
  const queryData = useFragment(QUERY_FRAGMENT, queryKey)
  const { width } = useWindowWidth()

  return (
    <Box>
      <ProjectPageHero project={data} query={queryData} />
      {/* Desktop: sticky tab bar + tab content */}
      <Flex
        gap="xl"
        alignItems="flex-start"
        maxWidth={pxToRem(1280)}
        flexWrap={['wrap', 'nowrap']}
        width="100%"
        margin="auto"
        px={['md', 'lg']}
      >
        {width >= 768 && <ProjectPageTabsDesktop project={data} />}
        <ParticipationSteps project={data} />
        {width <= 767 && <ProjectPageTabsMobile project={data} />}
      </Flex>
    </Box>
  )
}

export default ProjectPageLayout
