import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import AppBox from '~ui/Primitives/AppBox'
import RenderCustomAccessLegacy from './RenderCustomAccessLegacy'
import RenderPrivateAccessLegacy from './RenderPrivateAccessLegacy'
import type { ProjectRestrictedAccessFragmentLegacy_project$key } from '~relay/ProjectRestrictedAccessFragmentLegacy_project.graphql'

type Props = {
  project: ProjectRestrictedAccessFragmentLegacy_project$key
  isOnProjectCard?: boolean
}
const FRAGMENT = graphql`
  fragment ProjectRestrictedAccessFragmentLegacy_project on Project
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    visibility

    ...RenderCustomAccessLegacy_project @arguments(count: $count, cursor: $cursor)
    ...RenderPrivateAccessLegacy_project
  }
`

const ProjectRestrictedAccessFragmentLegacy = ({ project, isOnProjectCard = false }: Props): JSX.Element => {
  const data = useFragment(FRAGMENT, project)

  if (data && data.visibility) {
    if (data.visibility === 'CUSTOM') {
      return (
        <AppBox
          style={{
            cursor: 'pointer',
          }}
          position="absolute"
          top={isOnProjectCard ? '-44px' : '12px'}
          right={isOnProjectCard ? 0 : '10px'}
        >
          <React.Fragment>
            <RenderCustomAccessLegacy project={data} isOnProjectCard={isOnProjectCard} />
          </React.Fragment>
        </AppBox>
      )
    }

    if (data.visibility === 'ME' || data.visibility === 'ADMIN') {
      return (
        <AppBox position="absolute" top={isOnProjectCard ? '-44px' : '12px'} right={isOnProjectCard ? 0 : '10px'}>
          <React.Fragment>
            <RenderPrivateAccessLegacy project={data} isOnProjectCard={isOnProjectCard} />
          </React.Fragment>
        </AppBox>
      )
    }
  }

  return null
}

export default ProjectRestrictedAccessFragmentLegacy
