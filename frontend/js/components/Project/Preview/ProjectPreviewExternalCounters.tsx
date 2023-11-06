import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import ProjectPreviewCounter from './ProjectPreviewCounter'
import TagsList from '../../Ui/List/TagsList'
import type { ProjectPreviewExternalCounters_project } from '~relay/ProjectPreviewExternalCounters_project.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { getExternalExposedLink } from '~/utils/externalExposedLink'
type Props = {
  readonly project: ProjectPreviewExternalCounters_project
}
export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  .link-gray {
    color: ${colors.darkGray};
    font-size: 16px;
  }

  .word-breaker {
    word-break: break-all;
    margin-left: -1px;
  }
`
export class ProjectPreviewExternalCounters extends React.Component<Props> {
  render() {
    const { project } = this.props
    return (
      <>
        <Container className="mb-15 inline">
          <Icon name={ICON_NAME.link} size={16} color={colors.darkGray} />
          <span className="link-gray ml-5 word-breaker">
            {project && project.externalLink ? getExternalExposedLink(project.externalLink) : ''}
          </span>
        </Container>
        <TagsList>
          {project.externalContributionsCount !== null && project.externalContributionsCount !== undefined && (
            <ProjectPreviewCounter
              showZero
              value={project.externalContributionsCount}
              label="project.preview.counters.contributions"
              icon="cap-baloon-1"
              archived={project.archived}
            />
          )}
          {project.externalVotesCount !== null && project.externalVotesCount !== undefined && (
            <ProjectPreviewCounter
              showZero
              value={project.externalVotesCount}
              label="project.preview.counters.votes"
              icon="cap-hand-like-2-1"
              archived={project.archived}
            />
          )}
          {project.externalParticipantsCount !== null && project.externalParticipantsCount !== undefined && (
            <ProjectPreviewCounter
              showZero
              value={project.externalParticipantsCount}
              label="project.preview.counters.contributors"
              icon="cap-user-2-1"
              archived={project.archived}
            />
          )}
        </TagsList>
      </>
    )
  }
}
export default createFragmentContainer(ProjectPreviewExternalCounters, {
  project: graphql`
    fragment ProjectPreviewExternalCounters_project on Project {
      id
      externalLink
      externalParticipantsCount
      externalContributionsCount
      externalVotesCount
      archived
      ...ProjectRestrictedAccessFragmentLegacy_project
    }
  `,
})
