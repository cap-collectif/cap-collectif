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
import CookieMonster from '~/CookieMonster';

export type Props = {|
  +proposalSlug: string,
  +currentVotableStepId: ?string,
  +isAuthenticated: boolean,
|};

export const ProposalPage = ({ currentVotableStepId, isAuthenticated }: Props) => {
  const { proposalSlug } = useParams();
  const { state } = useLocation();
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions');
  const hasVotableStep = !!state?.currentVotableStepId || !!currentVotableStepId;

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
          $proposalRevisionsEnabled: Boolean!
          $token: String
        ) {
          ...ProposalPageLogic_query
            @arguments(
              proposalSlug: $proposalSlug
              hasVotableStep: $hasVotableStep
              stepId: $stepId
              count: $count
              cursor: $cursor
              isAuthenticated: $isAuthenticated
              proposalRevisionsEnabled: $proposalRevisionsEnabled
              token: $token
            )
          step: node(id: $stepId) @include(if: $hasVotableStep) {
            id
          }
        }
      `}
      variables={{
        proposalSlug,
        hasVotableStep,
        stepId: state?.currentVotableStepId || currentVotableStepId || '',
        count: PROPOSAL_FOLLOWERS_TO_SHOW,
        cursor: null,
        isAuthenticated,
        proposalRevisionsEnabled: proposalRevisionsEnabled && isAuthenticated,
        token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone(),
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
