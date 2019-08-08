// @flow
import React from 'react';
import { graphql, QueryRenderer, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import ProfileCommentList from '../ProfileCommentList';
import type {
  CommentPageQueryResponse,
  CommentPageQueryVariables,
} from '~relay/CommentPageQuery.graphql';

const query = graphql`
  query CommentPageQuery($userId: ID!, $isAuthenticated: Boolean!) {
    node(id: $userId) {
      ... on User {
        comments {
          ...ProfileCommentList_comments @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  }
`;

export type Props = {|
  userId: string,
  isAuthenticated: boolean,
|};

export const rendering = ({
  error,
  props,
}: {|
  ...ReadyState,
  props: ?CommentPageQueryResponse,
|}) => {
  if (error) {
    return graphqlError;
  }

  if (props && props.node && props.node.comments != null) {
    // $FlowFixMe
    return <ProfileCommentList comments={props.node.comments} />;
  }
  return <Loader />;
};

class CommentPage extends React.Component<Props> {
  render() {
    const { isAuthenticated, userId } = this.props;
    return (
      <>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={
            ({
              userId,
              isAuthenticated,
            }: CommentPageQueryVariables)
          }
          render={rendering}
        />
      </>
    );
  }
}

export default CommentPage;
