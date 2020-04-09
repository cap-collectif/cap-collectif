// @flow
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ProjectAdminAnalysisNoProposals_project } from '~relay/ProjectAdminAnalysisNoProposals_project.graphql';
import {
  AnalysisNoContributionIcon,
  AnalysisProposalListNoContributions,
} from '~ui/Analysis/common.style';

type Props = {|
  +project: ProjectAdminAnalysisNoProposals_project,
|};

export const ProjectAdminAnalysisNoProposals = ({ project }: Props) => {
  return (
    <AnalysisProposalListNoContributions>
      <AnalysisNoContributionIcon />
      <FormattedMessage id="empty.tab.title" tagName="p" />
      <FormattedMessage id="empty.tab.help.text" tagName="p" />
      {!project.firstAnalysisStep?.id &&
      project.firstCollectStep &&
      project.firstCollectStep.form ? (
        <FormattedHTMLMessage
          id="empty.tab.help.link"
          values={{ url: project.firstCollectStep.form.adminUrl }}
          tagName="p"
        />
      ) : null}
    </AnalysisProposalListNoContributions>
  );
};

export default createFragmentContainer(ProjectAdminAnalysisNoProposals, {
  project: graphql`
    fragment ProjectAdminAnalysisNoProposals_project on Project {
      id
      firstCollectStep {
        form {
          adminUrl
        }
      }
      firstAnalysisStep {
        id
      }
    }
  `,
});
