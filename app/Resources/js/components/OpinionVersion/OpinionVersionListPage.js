// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';

import Loader from '../Ui/FeedbacksIndicators/Loader';

import type {
  OpinionVersionListPageQueryVariables,
  OpinionVersionListPageQueryResponse,
} from '~relay/OpinionVersionListPageQuery.graphql';

import UserOpinionVersionListViewPaginated from '../User/UserOpinionVersionListViewPaginated';

export type Props = {|
  userId: string,
|};

export class OpinionVersionListPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query OpinionVersionListPageQuery($userId: ID!, $count: Int!, $cursor: String) {
            user: node(id: $userId) {
              ... on User {
                ...UserOpinionVersionListViewPaginated_user
                  @arguments(cursor: $cursor, count: $count)
              }
            }
          }
        `}
        variables={
          ({
            userId: this.props.userId,
            cursor: null,
            count: 25,
          }: OpinionVersionListPageQueryVariables)
        }
        render={({
          error,
          props,
        }: {
          props?: ?OpinionVersionListPageQueryResponse,
          ...ReactRelayReadyState,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props) {
            const { user } = props;
            if (!user) {
              return graphqlError;
            }
            return (
              <UserOpinionVersionListViewPaginated userId={this.props.userId} user={props.user} />
            );
          }
          return <Loader />;
        }}
      />
    );
  }
}

export default OpinionVersionListPage;
