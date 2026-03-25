'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageLayout_project$key } from '@relay/ProjectPageLayout_project.graphql'
import { Box } from '@cap-collectif/ui'

type Props = {
  project: ProjectPageLayout_project$key
}

const FRAGMENT = graphql`
  fragment ProjectPageLayout_project on Project {
    id
    title
  }
`

// Refonte page projet (#19461)
const ProjectPageLayout: React.FC<Props> = ({ project }) => {
  const data = useFragment(FRAGMENT, project)

  return <Box>{data.title}</Box>
}

export default ProjectPageLayout
