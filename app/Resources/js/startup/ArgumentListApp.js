// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { ArgumentListAppQueryResponse } from '~relay/ArgumentListAppQuery.graphql';
import ArgumentListProfile from '../components/Argument/ArgumentListProfile';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';

export default ({ userId, isAuthenticated }: { userId: string, isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ userId, count: 5, isAuthenticated }}
        environment={environment}
        query={graphql`
          query ArgumentListAppQuery(
            $userId: ID!
            $count: Int
            $cursor: String
            $isAuthenticated: Boolean!
          ) {
            node(id: $userId) {
              id
              ...ArgumentListProfile_argumentList
                @arguments(count: $count, cursor: $cursor, isAuthenticated: $isAuthenticated)
            }
          }
        `}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?ArgumentListAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }

          if (props && props.node) {
            return <ArgumentListProfile argumentList={props.node} />;
          }
          return <Loader />;
        }}
      />
    </IntlProvider>
  </Provider>
);
