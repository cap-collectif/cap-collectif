// @flow
import * as React from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import type { ProjectAdminAnalysisShortcut_project } from '~relay/ProjectAdminAnalysisShortcut_project.graphql';

type Props = {|
  +project: ProjectAdminAnalysisShortcut_project,
|};

export const ProjectAdminAnalysisShortcut = ({ project }: Props) => {
  if (!project.firstAnalysisStep) {
    return null;
  }

  if (!project.firstCollectStep?.form) {
    return null;
  }

  return (<FormattedHTMLMessage 
      tagName="p"
      id="reminder.step.configuration.analysis" values={{ step: project.firstAnalysisStep.title,  url: project.firstCollectStep?.form?.adminUrl }} />
  );
};

export default createFragmentContainer(
  ProjectAdminAnalysisShortcut,
  {
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
  }
);
