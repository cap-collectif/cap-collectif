import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import type {
    DeletePostMutation,
    DeletePostMutationResponse,
    DeletePostMutationVariables,
} from '@relay/DeletePostMutation.graphql';

const mutation = graphql`
    mutation DeletePostMutation($input: DeletePostInput!, $connections: [ID!]!) {
        deletePost(input: $input) {
            deletedPostId @deleteEdge(connections: $connections)
        }
    }
`;

const commit = (variables: DeletePostMutationVariables): Promise<DeletePostMutationResponse> =>
    commitMutation<DeletePostMutation>(environment, {
        mutation,
        variables,
        optimisticUpdater: store => {
            store.delete(variables.input.id);
        },
    });

export default { commit };
