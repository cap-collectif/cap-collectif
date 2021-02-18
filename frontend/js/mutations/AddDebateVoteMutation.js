// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateVoteMutationVariables,
  AddDebateVoteMutationResponse,
} from '~relay/AddDebateVoteMutation.graphql';

const mutation = graphql`
  mutation AddDebateVoteMutation($input: AddDebateVoteInput!, $isAuthenticated: Boolean!) {
    addDebateVote(input: $input) {
      errorCode
      previousVoteId
      debateVote {
        id
        published
        publishedAt
        publishableUntil
        notPublishedReason
        debate {
          id
          viewerHasArgument @include(if: $isAuthenticated)
          viewerHasVote @include(if: $isAuthenticated)
          viewerVote @include(if: $isAuthenticated) {
            type
          }
          yesVotes: votes(type: FOR) {
            totalCount
          }
          votes {
            totalCount
          }
        }
        type
        createdAt
        author {
          id
        }
      }
    }
  }
`;

const commit = (
  variables: AddDebateVoteMutationVariables,
): Promise<AddDebateVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const debateProxy = store.get(variables.input.debateId);
      if (!debateProxy) throw new Error('Expected debate to be in the store');

      const allVotes = debateProxy.getLinkedRecord('votes', { first: 0 });
      if (!allVotes) return;
      const previousValue = parseInt(allVotes.getValue('totalCount'), 10);
      allVotes.setValue(previousValue + 1, 'totalCount');

      if (variables.input.type === 'FOR') {
        const yesVotes = debateProxy.getLinkedRecord('votes', { first: 0, type: 'FOR' });
        if (!yesVotes) return;
        const previousValueFor = parseInt(yesVotes.getValue('totalCount'), 10);
        yesVotes.setValue(previousValueFor + 1, 'totalCount');
      }
    },
  });

export default { commit };
