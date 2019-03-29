// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesStep from './ProposalsUserVotesStep';
import type { ProposalsUserVotesPage_project } from './__generated__/ProposalsUserVotesPage_project.graphql';

type Props = {
  project: ProposalsUserVotesPage_project,
};

class ProposalsUserVotesPage extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <section className="section--custom">
        <div className="container text-center">
          <h1 className="mb-0">
            <FormattedMessage id="project.votes.title" />
          </h1>
        </div>
        <div className="section--custom">
          <div className="container">
            {project.votableSteps.length > 0 ? (
              project.votableSteps
                .filter(step => !!step.id)
                .map((step, index) => <ProposalsUserVotesStep key={index} step={step} />)
            ) : (
              <p>
                <FormattedMessage id="project.votes.no_active_step" />
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default createFragmentContainer(ProposalsUserVotesPage, {
  project: graphql`
    fragment ProposalsUserVotesPage_project on Project {
      id
      votableSteps {
        id
        ...ProposalsUserVotesStep_step @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `,
});
