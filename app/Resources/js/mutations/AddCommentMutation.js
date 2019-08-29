// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddCommentMutationVariables,
  AddCommentMutationResponse,
} from '~relay/AddCommentMutation.graphql';

const mutation = graphql`
  mutation AddCommentMutation($input: AddCommentInput!, $isAuthenticated: Boolean!) {
    addComment(input: $input) {
      commentEdge {
        cursor
        node {
          id
          ...Comment_comment @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: AddCommentMutationVariables): Promise<AddCommentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.commentableId,
        edgeName: 'commentEdge',
        connectionInfo: [
          {
            key: 'CommentListViewPaginated_comments',
            rangeBehavior: 'prepend',
            filters: {
              orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
            },
          },
          {
            key: 'CommentListViewPaginated_comments',
            rangeBehavior: 'append',
            filters: {
              orderBy: { field: 'POPULARITY', direction: 'DESC' },
            },
          },
          {
            key: 'CommentListViewPaginated_comments',
            rangeBehavior: 'append',
            filters: {
              orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
            },
          },
          {
            key: 'CommentAnswers_answers',
            rangeBehavior: 'append',
            filters: {},
          },
        ],
      },
    ],
    updater: (store: ReactRelayRecordSourceSelectorProxy) => {
      const payload = store.getRootField('addComment');
      if (!payload || !payload.getLinkedRecord('commentEdge')) {
        return;
      }

      const commentableProxy = store.get(variables.input.commentableId);
      if (!commentableProxy) {
        throw new Error('Expected commentable to be in the store');
      }

      const answersConnection = ConnectionHandler.getConnection(
        commentableProxy,
        'CommentAnswers_answers',
      );
      if (answersConnection) {
        // $FlowFixMe argument 1 must be a int
        answersConnection.setValue(answersConnection.getValue('totalCount') + 1, 'totalCount');
      }

      const commentsConnection = ConnectionHandler.getConnection(
        commentableProxy,
        'CommentListViewPaginated_comments',
        {
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
      );
      if (commentsConnection) {
        // $FlowFixMe argument 1 must be a int
        commentsConnection.setValue(commentsConnection.getValue('totalCount') + 1, 'totalCount');
      }

      // TODO (minor) increment totalCountWithAnswers when posting and answer
      // We probably need to add the root commentableId as a variable
      const rootCommentableProxy = store.get(variables.input.commentableId);
      if (!rootCommentableProxy) return;

      const allCommentsProxy = rootCommentableProxy.getLinkedRecord('comments', {
        first: 0,
      });
      if (!allCommentsProxy) return;
      const previousValue = parseInt(allCommentsProxy.getValue('totalCountWithAnswers'), 10);
      allCommentsProxy.setValue(previousValue + 1, 'totalCountWithAnswers');
    },
  });

export default { commit };
