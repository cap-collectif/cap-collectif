// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type {
  ProposalsUserVotesPageAppQueryResponse,
  ProposalsUserVotesPageAppQueryVariables,
} from '~relay/ProposalsUserVotesPageAppQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalsUserVotesPage = lazy(() =>
  import(/* webpackChunkName: "ProposalsUserVotesPage" */ '~/components/Project/Votes/ProposalsUserVotesPage'),
);

export default (data: { projectId: string }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        variables={
          ({
            project: data.projectId,
            isAuthenticated: true,
          }: ProposalsUserVotesPageAppQueryVariables)
        }
        environment={environment}
        query={graphql`
          query ProposalsUserVotesPageAppQuery($project: ID!, $isAuthenticated: Boolean!) {
            project: node(id: $project) {
              ...ProposalsUserVotesPage_project @arguments(isAuthenticated: $isAuthenticated)
            }
          }
        `}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?ProposalsUserVotesPageAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.project) {
              return <ProposalsUserVotesPage project={props.project} />;
            }
            return graphqlError;
          }
          return null;
        }}
      />
    </Providers>
  </Suspense>
);
