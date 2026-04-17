'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageCustomTab_project$key } from '@relay/ProjectPageCustomTab_project.graphql'
import { Box } from '@cap-collectif/ui'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  project: ProjectPageCustomTab_project$key
  activeTab: string
}

const FRAGMENT = graphql`
  fragment ProjectPageCustomTab_project on Project {
    tabs {
      id
      ... on ProjectTabPresentation {
        body
      }
      ... on ProjectTabCustom {
        body
      }
    }
  }
`

const ProjectPageCustomTab: React.FC<Props> = ({ project: projectRef, activeTab }) => {
  const project = useFragment(FRAGMENT, projectRef)
  const tab = project.tabs.find(t => t.id === activeTab)

  return (
    <Box maxWidth={pxToRem(1280)} mx="auto" px={['md', 'lg']} py="xl">
      <WYSIWYGRender value={(tab && 'body' in tab ? tab.body : null) ?? ''} />
    </Box>
  )
}

export default ProjectPageCustomTab
