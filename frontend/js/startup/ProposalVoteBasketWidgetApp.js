// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  ProposalVoteBasketWidgetAppQueryResponse,
  ProposalVoteBasketWidgetAppQueryVariables,
} from '~relay/ProposalVoteBasketWidgetAppQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';
import CookieMonster from '~/CookieMonster';

const ProposalVoteBasketWidget = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalVoteBasketWidget" */ '~/components/Proposal/Vote/ProposalVoteBasketWidget'
    ),
);

type Props = {
  stepId: string,
  votesPageUrl: string,
  isAuthenticated: boolean,
};

export default (data: Props) => {
  return (
    <Suspense fallback={<Loader />}>
      <Providers>
        <QueryRenderer
          variables={
            ({
              stepId: data.stepId,
              isAuthenticated: data.isAuthenticated,
              token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()
            }: ProposalVoteBasketWidgetAppQueryVariables)
          }
          environment={environment}
          query={graphql`
          query ProposalVoteBasketWidgetAppQuery($stepId: ID!, $isAuthenticated: Boolean!, $token: String) {
            step: node(id: $stepId) {
              ...ProposalVoteBasketWidget_step @arguments(token: $token)
            }
            viewer @include(if: $isAuthenticated) {
              ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId)
            }
          }
        `}
          render={({
                     error,
                     props,
                   }: {
            ...ReactRelayReadyState,
            props: ?ProposalVoteBasketWidgetAppQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              if (props.step) {
                return (
                  <ProposalVoteBasketWidget
                    step={props.step}
                    viewer={props.viewer}
                    votesPageUrl={data.votesPageUrl}
                  />
                );
              }
              return graphqlError;
            }
            return null;
          }}
        />
      </Providers>
    </Suspense>
  );
};
