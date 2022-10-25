// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler, type RecordProxy } from 'relay-runtime';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
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
          author {
            id
          }
          moderationStatus
          authorEmail
          isEmailConfirmed
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const connectionsConfig = [
  {
    key: 'CommentListViewPaginated_comments',
    filters: {
      orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
    },
  },
  {
    key: 'CommentListViewPaginated_comments',
    filters: {
      orderBy: { field: 'POPULARITY', direction: 'DESC' },
    },
  },
  {
    key: 'CommentListViewPaginated_comments',
    filters: {
      orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
    },
  },
  {
    key: 'CommentAnswers_answers',
    filters: {},
  },
];
const addConnection = (
  store: RecordSourceSelectorProxy,
  commentableId: string,
  newEdge: RecordProxy,
  key: string,
  filters: {} = {},
) => {
  const commentProxy = store.get(commentableId);
  if (!commentProxy) return;

  const conn = ConnectionHandler.getConnection(commentProxy, key, filters);

  if (!conn) return;
  ConnectionHandler.insertEdgeAfter(conn, newEdge);
};

const commit = (variables: AddCommentMutationVariables): Promise<AddCommentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addComment');
      const commentEdge = payload?.getLinkedRecord('commentEdge');
      if (!commentEdge) {
        return;
      }
      const node = commentEdge?.getLinkedRecord('node');
      const isAnonymousUser = node?.getValue('authorEmail');

      if (node?.getValue('moderationStatus') === 'PENDING' && isAnonymousUser) return;
      if (node?.getValue('moderationStatus') === 'PENDING' && !isAnonymousUser) {
        addConnection(
          store,
          variables.input.commentableId,
          commentEdge,
          'CommentListNotApprovedByModerator_viewerNotApprovedByModeratorComments',
        );
        return;
      }

      connectionsConfig.forEach(({ key, filters }) => {
        addConnection(store, variables.input.commentableId, commentEdge, key, filters);
      });

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
