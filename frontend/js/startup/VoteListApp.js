// @flow
import React, { lazy, Suspense } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { VoteListAppQueryResponse } from '~relay/VoteListAppQuery.graphql';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

const VoteListProfile = lazy(() =>
  import(/* webpackChunkName: "VoteListProfile" */ '~/components/Vote/VoteListProfile'),
);

const DebateVoteListProfile = lazy(() =>
  import(/* webpackChunkName: "DebateVoteListProfile" */ '~/components/Vote/DebateVoteListProfile'),
);

export default ({ userId }: { userId: string }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QueryRenderer
        variables={{ userId, count: 5, cursor: null }}
        environment={environment}
        query={graphql`
          query VoteListAppQuery($userId: ID!, $count: Int!, $cursor: String) {
            node(id: $userId) {
              id
              ...VoteListProfile_voteList @arguments(count: $count, cursor: $cursor)
              ...DebateVoteListProfile_debateVoteList @arguments(count: $count, cursor: $cursor)
            }
          }
        `}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?VoteListAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }

          if (props && props.node) {
            return (
              <>
                <VoteListProfile voteList={props.node} />
                <DebateVoteListProfile debateVoteList={props.node} />
              </>
            );
          }
          return <Loader />;
        }}
      />
    </Providers>
  </Suspense>
);
