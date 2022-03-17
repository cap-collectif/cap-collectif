// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import { useParams, useLocation } from 'react-router-dom';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '~/constants/ProposalConstants';
import type { ProposalPageQueryResponse } from '~relay/ProposalPageQuery.graphql';
import ProposalPageLogic from './ProposalPageLogic';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

export type Props = {|
  +proposalSlug: string,
  +currentVotableStepId: ?string,
  +opinionCanBeFollowed: boolean,
  +isAuthenticated: boolean,
  +hasVotableStep: boolean,
  +votesPageUrl: string,
  +showVotesWidget: boolean,
|};

export const ProposalPage = ({
  currentVotableStepId,
  isAuthenticated,
  opinionCanBeFollowed,
  hasVotableStep,
  votesPageUrl,
  showVotesWidget,
}: Props) => {
  const { slug } = useParams();
  const { state } = useLocation();
  const isTipsMeeeEnabled = useFeatureFlag('unstable__tipsmeee');
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions');
  return (
    <QueryRenderer
      fetchPolicy="store-and-network"
      environment={environment}
      query={graphql`
        query ProposalPageQuery(
          $proposalSlug: String!
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
              proposalSlug: $proposalSlug
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
        proposalSlug: slug,
        hasVotableStep: !!state?.currentVotableStepId || !!currentVotableStepId,
        stepId: state?.currentVotableStepId || currentVotableStepId || '',
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
          console.warn("L'étape n'a pas pu être récupérée"); // eslint-disable-line no-console
        }
        return (
          <ProposalPageLogic
            queryRef={props}
            hasVotableStep={hasVotableStep}
            opinionCanBeFollowed={opinionCanBeFollowed}
            votesPageUrl={votesPageUrl}
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
