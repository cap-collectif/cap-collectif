import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import { Col } from 'react-bootstrap'
import ProjectType from './ProjectType'
import ProjectCover from './ProjectCover'
import ProjectPreviewBody from './ProjectPreviewBody'
import { Card } from '~ui/Card/Card'
import type { ProjectPreview_project } from '~relay/ProjectPreview_project.graphql'
import type { State, FeatureToggles } from '~/types'
import ProjectCard from '~ui/Project/ProjectCard'
import Flex from '~ui/Primitives/Layout/Flex'
type Props = {
  readonly project: ProjectPreview_project
  readonly hasSecondTitle?: boolean
  readonly features: FeatureToggles
  readonly isProjectsPage: boolean
  readonly forceNewCardDesign?: boolean | null | undefined
}
export const ProjectPreview = ({ project, hasSecondTitle, features, isProjectsPage, forceNewCardDesign }: Props) => {
  const projectID = project.id ? `project-preview-${project.id}` : 'project-preview'
  if (features.new_project_card || forceNewCardDesign)
    return (
      <Flex mt={7} mb={7} mr={5} ml={5}>
        <ProjectCard project={project} isProjectsPage={isProjectsPage} />
      </Flex>
    )
  return (
    <Col xs={12} sm={6} md={4} lg={3} className="d-flex">
      <Card id={projectID} className="project-preview">
        <ProjectType project={project} />
        <ProjectCover project={project} />
        <ProjectPreviewBody project={project} hasSecondTitle={hasSecondTitle} />
      </Card>
    </Col>
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
      ...ProjectCard_project
      ...ProjectPreviewBody_project
      ...ProjectType_project
      ...ProjectCover_project
    }
  `,
})
