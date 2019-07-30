// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import ProposalList from '../components/Proposal/List/ProposalList';
import type { ProposalListAppQueryResponse } from '~relay/ProposalListAppQuery.graphql';

export default ({ authorId, isAuthenticated }: { authorId: string, isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{ authorId, isProfileView: true, isAuthenticated, stepId: '' }}
        environment={environment}
        query={graphql`
          query ProposalListAppQuery($stepId: ID!, $authorId: ID!, $isAuthenticated: Boolean!) {
            user: node(id: $authorId) {
              ... on User {
                proposals {
                  ...ProposalList_proposals
                }
              }
            }
            viewer @include(if: $isAuthenticated) {
              ...ProposalList_viewer
            }
          }
        `}
        render={({ error, props }: { props: ?ProposalListAppQueryResponse, ...ReadyState }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.user && props.user.proposals) {
              return (
                <ProposalList
                  step={null}
                  proposals={props.user.proposals}
                  viewer={props.viewer || null}
                  view="mosaic"
                />
              );
            }
            return graphqlError;
          }
          return null;
        }}
      />
    </IntlProvider>
  </Provider>
);
