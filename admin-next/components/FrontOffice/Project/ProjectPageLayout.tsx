'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Box, Flex } from '@cap-collectif/ui'
import { ProjectPageLayout_project$key } from '@relay/ProjectPageLayout_project.graphql'
import { ProjectPageLayout_query$key } from '@relay/ProjectPageLayout_query.graphql'
import ProjectPageHero from './ProjectPageHero'
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
    ...ProjectPageHero_project
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

  return (
    <Box>
      <ProjectPageHero project={data} query={queryData} />
      <Flex gap="xl" alignItems="flex-start" maxWidth={pxToRem(1280)} width="100%" margin="auto" px="lg">
        <Box flex="1" bg="gray.100" borderRadius="normal" p="lg">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} style={{ marginBottom: '1rem' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur.
            </p>
          ))}
        </Box>
        <ParticipationSteps project={data} />
      </Flex>
    </Box>
  )
}

export default ProjectPageLayout
