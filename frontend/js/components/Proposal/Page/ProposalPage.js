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
  isTipsMeeeEnabled: boolean,
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
      isTipsMeeeEnabled,
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
              $isTipsMeeeEnabled: Boolean!
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
                  isTipsMeeeEnabled: $isTipsMeeeEnabled
                  proposalRevisionsEnabled: $proposalRevisionsEnabled
                )
              step: node(id: $stepId) @include(if: $hasVotableStep) {
                id
              }
            }
          `}
          variables={{
            proposalId,
            hasVotableStep: !!currentVotableStepId,
            stepId: currentVotableStepId || '',
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
            isAuthenticated,
            isTipsMeeeEnabled,
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
            if (props && hasVotableStep && !props.step) {
              console.error("L'étape n'a pas pu être récupérée"); // eslint-disable-line no-console
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
  isTipsMeeeEnabled: state.default.features.unstable__tipsmeee,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPage);
