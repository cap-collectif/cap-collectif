// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import IntlProvider from './IntlProvider';
import environment, { graphqlError } from '../createRelayEnvironment';
import UserCommentsPaginated, {
  COMMENT_PAGINATION,
} from '../components/Comment/UserCommentsPaginated';
import type { ProfileUserCommentAppQueryResponse } from '~relay/ProfileUserCommentAppQuery.graphql';

export default ({ userId, isAuthenticated }: { userId: string, isAuthenticated: boolean }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        variables={{
          userId,
          isAuthenticated,
          count: COMMENT_PAGINATION,
          cursor: null,
        }}
        environment={environment}
        query={graphql`
          query ProfileUserCommentAppQuery(
            $userId: ID!
            $isAuthenticated: Boolean!
            $count: Int!
            $cursor: String
          ) {
            user: node(id: $userId) {
              id
              ...UserCommentsPaginated_user
                @arguments(
                  userId: $userId
                  count: $count
                  isAuthenticated: $isAuthenticated
                  cursor: $cursor
                )
            }
          }
        `}
        render={({
          error,
          props,
        }: {
          ...ReadyState,
          props: ?ProfileUserCommentAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            if (props.user && props.user.id) {
              return (
                // $FlowFixMe
                <UserCommentsPaginated user={props.user} />
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
