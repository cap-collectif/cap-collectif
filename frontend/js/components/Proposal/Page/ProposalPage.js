// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '~/constants/ProposalConstants';
import type { ProposalPageQueryResponse } from '~relay/ProposalPageQuery.graphql';
import ProposalPageLogic from './ProposalPageLogic';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

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
|};

export const ProposalPage = ({
  proposalId,
  proposalTitle,
  currentVotableStepId,
  isAuthenticated,
  opinionCanBeFollowed,
  hasVotableStep,
  votesPageUrl,
  image,
  showVotesWidget,
}: Props) => {
  const isTipsMeeeEnabled = useFeatureFlag('unstable__tipsmeee');
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions');

  return (
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
            queryRef={props}
            title={proposalTitle}
            hasVotableStep={hasVotableStep}
            opinionCanBeFollowed={opinionCanBeFollowed}
            votesPageUrl={votesPageUrl}
            image={image}
            showVotesWidget={showVotesWidget}
            isAuthenticated={isAuthenticated}
          />
        );
      }}
    />
  );
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPage);
