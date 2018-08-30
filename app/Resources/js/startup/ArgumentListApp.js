// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import type { ArgumentListAppQueryResponse } from './__generated__/ArgumentListAppQuery.graphql';

export default ({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ isAuthenticated }}
        environment={environment}
        query={graphql`
          query ArgumentListAppQuery($isAuthenticated: Boolean!) {
            viewer @include(if: $isAuthenticated) {
              arguments(first: 5) {
                edges {
                  node {
                    id
                  }
                }
              }
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
          // $FlowFixMe
          const nodeArguments = props.viewer.arguments.edges;

          return (
            <ul>
              {// $FlowFixMe
              nodeArguments.map(argument => (
                <li key={argument.node.id}>{argument.node.id}</li>
              ))}
            </ul>
          );
        }}
      />
    </IntlProvider>
  </Provider>
);
