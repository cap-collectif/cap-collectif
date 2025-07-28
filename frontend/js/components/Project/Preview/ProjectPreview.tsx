import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import type { ProjectPreview_project$data } from '~relay/ProjectPreview_project.graphql'
import type { State } from '~/types'
import Flex from '~ui/Primitives/Layout/Flex'
import ProjectCard from '@shared/projectCard/ProjectCard'

type Props = {
  project: ProjectPreview_project$data
  isProjectsPage: boolean
}

export const ProjectPreview = ({ project, isProjectsPage }: Props) => {
  return (
    <Flex mt={7} mb={7} mr={5} ml={5}>
      <ProjectCard project={project} isProjectsPage={isProjectsPage} />
    </Flex>
  )
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
})

const connector = connect(mapStateToProps)
export default createFragmentContainer(connector(ProjectPreview), {
  project: graphql`
    fragment ProjectPreview_project on Project {
      id
      ...ProjectCardshared_project
    }
  `,
})
