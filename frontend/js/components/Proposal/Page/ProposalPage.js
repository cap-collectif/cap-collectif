// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '~/constants/ProposalConstants';
import type { ProposalPageQueryResponse } from '~relay/ProposalPageQuery.graphql';
import ProposalPageLogic from './ProposalPageLogic';

export type Props = {|
  proposalId: string,
  proposalTitle: string,
  currentVotableStepId: ?string,
  opinionCanBeFollowed: boolean,
  isAuthenticated: boolean,
  hasVotableStep: boolean,
  votesPageUrl: string,
  image: string,
  showVotesWidget: boolean,
  proposalRevisionsEnabled: boolean,
|};

export class ProposalPage extends React.Component<Props> {
  render() {
    const {
      proposalId,
      proposalTitle,
      currentVotableStepId,
      isAuthenticated,
      opinionCanBeFollowed,
      hasVotableStep,
      votesPageUrl,
      image,
      showVotesWidget,
      proposalRevisionsEnabled,
    } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalPageQuery(
              $proposalId: ID!
              $hasVotableStep: Boolean!
              $stepId: ID!
              $count: Int!
              $cursor: String
              $isAuthenticated: Boolean!
              $proposalRevisionsEnabled: Boolean!
            ) {
              ...ProposalPageLogic_query
                @arguments(
                  proposalId: $proposalId
                  hasVotableStep: $hasVotableStep
                  stepId: $stepId
                  count: $count
                  cursor: $cursor
                  isAuthenticated: $isAuthenticated
                  proposalRevisionsEnabled: $proposalRevisionsEnabled
                )
            }
          `}
          variables={{
            proposalId,
            hasVotableStep: !!currentVotableStepId,
            stepId: currentVotableStepId || '',
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
            isAuthenticated,
            proposalRevisionsEnabled: proposalRevisionsEnabled && isAuthenticated,
          }}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?ProposalPageQueryResponse,
          }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            return (
              <ProposalPageLogic
                query={props}
                title={proposalTitle}
                hasVotableStep={hasVotableStep}
                opinionCanBeFollowed={opinionCanBeFollowed}
                votesPageUrl={votesPageUrl}
                image={image}
                showVotesWidget={showVotesWidget}
              />
            );
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
  proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
});

export default connect(mapStateToProps)(ProposalPage);
