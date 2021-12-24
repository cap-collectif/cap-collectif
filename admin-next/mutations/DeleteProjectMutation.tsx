import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteProjectMutation,
    DeleteProjectMutationResponse,
    DeleteProjectMutationVariables,
} from '@relay/DeleteProjectMutation.graphql';

const mutation = graphql`
    mutation DeleteProjectMutation($input: DeleteProjectInput!, $connections: [ID!]!)
    @raw_response_type {
        deleteProject(input: $input) {
            deletedProjectId @deleteEdge(connections: $connections)
        }
    }
`;

const commit = (
    variables: DeleteProjectMutationVariables,
): Promise<DeleteProjectMutationResponse> =>
    commitMutation<DeleteProjectMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            deleteProject: {
                deletedProjectId: variables.input.id,
            },
        },
    });

export default { commit };
