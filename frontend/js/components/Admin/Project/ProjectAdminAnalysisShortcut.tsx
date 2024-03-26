import * as React from 'react'

import styled from 'styled-components'
import { FormattedHTMLMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import type { ProjectAdminAnalysisShortcut_project } from '~relay/ProjectAdminAnalysisShortcut_project.graphql'
const Shortcut = styled.p`
  margin: 0 0 15px 0;
`
type Props = {
  readonly project: ProjectAdminAnalysisShortcut_project
}
export const ProjectAdminAnalysisShortcut = ({ project }: Props) => {
  if (!project.firstAnalysisStep || !project.firstCollectStep?.form) {
    return null
  }

  return (
    <FormattedHTMLMessage
      id="reminder.step.configuration.analysis"
      values={{
        step: project.firstAnalysisStep.title,
        url: project.firstCollectStep?.form?.adminUrl,
      }}
    >
      {message => (
        <Shortcut
          dangerouslySetInnerHTML={{
            __html: message,
          }}
        />
      )}
    </FormattedHTMLMessage>
  )
}
export default createFragmentContainer(ProjectAdminAnalysisShortcut, {
  project: graphql`
    fragment ProjectAdminAnalysisShortcut_project on Project {
      id
      firstCollectStep {
        form {
          adminUrl
        }
      }
      firstAnalysisStep {
        title
      }
    }
  `,
})
