// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { VoteListAppQueryResponse } from '~relay/VoteListAppQuery.graphql';
import VoteListProfile from '../components/Vote/VoteListProfile';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

export default ({ userId }: { userId: string }) => (
  <Providers>
    <QueryRenderer
      variables={{ userId, count: 5, cursor: null }}
      environment={environment}
      query={graphql`
        query VoteListAppQuery($userId: ID!, $count: Int!, $cursor: String) {
          node(id: $userId) {
            id
            ...VoteListProfile_voteList @arguments(count: $count, cursor: $cursor)
          }
        }
      `}
      render={({ error, props }: { ...ReactRelayReadyState, props: ?VoteListAppQueryResponse }) => {
        if (error) {
          return graphqlError;
        }

        if (props && props.node) {
          return <VoteListProfile voteList={props.node} />;
        }
        return <Loader />;
      }}
    />
  </Providers>
);
