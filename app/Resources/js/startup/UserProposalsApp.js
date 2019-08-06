// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import UserProposalsPaginated, {
  PROPOSAL_PAGINATION,
} from '../components/User/Profile/UserProposalsPaginated';
import type { UserProposalsAppQueryResponse } from '~relay/UserProposalsAppQuery.graphql';

export default ({ authorId, isAuthenticated }: { authorId: string, isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{
          authorId,
          isProfileView: true,
          isAuthenticated,
          stepId: '',
          count: PROPOSAL_PAGINATION,
          cursor: null,
        }}
        environment={environment}
        query={graphql`
          query UserProposalsAppQuery(
            $stepId: ID!
            $authorId: ID!
            $isAuthenticated: Boolean!
            $count: Int!
            $isProfileView: Boolean!
            $cursor: String
          ) {
            user: node(id: $authorId) {
              id
              ...UserProposalsPaginated_user
                @arguments(
                  count: $count
                  isAuthenticated: $isAuthenticated
                  isProfileView: $isProfileView
                  stepId: $stepId
                  cursor: $cursor
                )
            }
          }
        `}
        render={({ error, props }: { ...ReadyState, props: ?UserProposalsAppQueryResponse }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.user && props.user.id) {
              return (
                // $FlowFixMe
                <UserProposalsPaginated user={props.user} />
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
