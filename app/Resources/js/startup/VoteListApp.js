// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { VoteListAppQueryResponse } from '~relay/VoteListAppQuery.graphql';
import VoteListProfile from '../components/Vote/VoteListProfile';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

export default ({ userId }: { userId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ userId, count: 5 }}
        environment={environment}
        query={graphql`
          query VoteListAppQuery($userId: ID!, $count: Int, $after: String) {
            node(id: $userId) {
              id
              ...VoteListProfile_voteList @arguments(count: $count, after: $after)
            }
          }
        `}
        render={({ error, props }: { props: ?VoteListAppQueryResponse } & ReadyState) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return <Loader />;
          }

          return (
            // $FlowFixMe
            <VoteListProfile voteList={props.node} />
          );
        }}
      />
    </IntlProvider>
  </Provider>
);
