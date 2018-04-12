// @flow
import * as React from 'react';
// import { Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
// import ProposalUserVoteItem from './ProposalUserVoteItem';
import { graphql, createFragmentContainer, type RelayRefetchProp } from 'react-relay';

type Props = {
  project: Object,
  relay: RelayRefetchProp,
};

class ProposalsUserVotesPage extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <div>
        <div className="container container--custom text-center">
          <h1 style={{ marginBottom: '0' }}>{<FormattedMessage id="project.votes.title" />}</h1>
        </div>
        <div className="container container--custom">
          {project.votableSteps.length > 0 ? (
            project.votableSteps.map((step, index) => (
              <div key={index} className="block">
                {project.votableSteps.length > 1 ? (
                  <h2>
                    <a
                      className="pull-left btn btn-default"
                      href={step.show_url}
                      style={{ marginRight: '15px' }}>
                      <i className="cap cap-arrow-1-1" />
                      <span>
                        {' '}
                        <FormattedMessage id="project.votes.back" />
                      </span>
                    </a>
                    {`${step.title} `}
                    {step.voteType === 'BUDGET' ? (
                      <FormattedMessage id="project.votes.type.budget" />
                    ) : (
                      <FormattedMessage id="project.votes.type.simple" />
                    )}
                  </h2>
                ) : (
                  <p>
                    <a className="btn btn-default" href={step.show_url}>
                      <i className="cap cap-arrow-1-1" />
                      <span>
                        {' '}
                        <FormattedMessage id="project.votes.back" />
                      </span>
                    </a>
                  </p>
                )}
                {step.votesHelpText && (
                  <div dangerouslySetInnerHTML={{ __html: step.votesHelpText }} />
                )}
                {/* <h3>
                  <FormattedMessage
                    id="project.votes.nb"
                    values={{
                      num: userVotesByStepId[step.id].length,
                    }}
                  />
                </h3>
                <Row className="proposals-user-votes__table">
                  {userVotesByStepId[step.id].map((proposal, index2) => (
                    <ProposalUserVoteItem key={index2} proposal={proposal} step={step} />
                  ))}
                </Row> */}
              </div>
            ))
          ) : (
            <p>
              <FormattedMessage id="project.votes.no_active_step" />
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalsUserVotesPage,
  {
    project: graphql`
      fragment ProposalsUserVotesPage_project on Project {
        id
        votableSteps {
          ... on CollectStep {
            id
            title
            voteType
            votesHelpText
            show_url
          }
          ... on SelectionStep {
            id
            title
            voteType
            votesHelpText
            show_url
          }
        }
      }
    `,
  },
  // viewer: graphql`
  //   fragment ProposalsUserVotesPage_viewer on User
  //     @argumentDefinitions(
  //       step: { type: "ID", nonNull: false },
  //       withVotes: {type: "Boolean!", defaultValue: false}
  //     )
  //   {
  //     id
  //     proposalVotes(step: $step) @include(if: $withVotes) {
  //       totalCount
  //       creditsLeft
  //       creditsSpent
  //     }
  //   }
  // `}
  // ,
  // graphql`
  //    query ProposalsUserVotesPageQuery($step: ID!, $withVotes: Boolean!) {
  //      viewer {
  //        ...ProposalsUserVotesPage_viewer @arguments(step: $step, withVotes: $withVotes)
  //      }
  //    }
  //  `
);
