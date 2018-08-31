// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { ArgumentListAppQueryResponse } from './__generated__/ArgumentListAppQuery.graphql';
import ArgumentListProfile from '../components/Argument/ArgumentListProfile';

export default ({ userId }: { userId: string }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ userId, count: 5 }}
        environment={environment}
        query={graphql`
          query ArgumentListAppQuery($userId: ID!, $count: Int, $after: String) {
            node(id: $userId) {
              id
              ...ArgumentListProfile_argumentList @arguments(count: $count, after: $after)
            }
          }
        `}
        render={({ error, props }: { props: ?ArgumentListAppQueryResponse } & ReadyState) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return null;
          }

          return (
            // $FlowFixMe
            <ArgumentListProfile argumentList={props.node} />
          );
        }}
      />
    </IntlProvider>
  </Provider>
);
