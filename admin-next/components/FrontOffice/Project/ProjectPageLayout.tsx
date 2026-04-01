'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageLayout_project$key } from '@relay/ProjectPageLayout_project.graphql'
import { ProjectPageLayout_query$key } from '@relay/ProjectPageLayout_query.graphql'
import { Box } from '@cap-collectif/ui'
import ProjectPageHero from './ProjectPageHero'

type Props = {
  project: ProjectPageLayout_project$key
  query: ProjectPageLayout_query$key
}

const FRAGMENT = graphql`
  fragment ProjectPageLayout_project on Project {
    id
    title
    ...ProjectPageHero_project
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
    </Box>
  )
}

export default ProjectPageLayout
