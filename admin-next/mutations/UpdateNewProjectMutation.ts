import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import {
    UpdateNewProjectMutation,
    UpdateNewProjectMutationResponse,
    UpdateNewProjectMutationVariables,
} from '@relay/UpdateNewProjectMutation.graphql';

const mutation = graphql`
    mutation UpdateNewProjectMutation($input: UpdateNewProjectInput!) {
        updateNewProject(input: $input) {
            project {
                title
            }
        }
    }
`;

const commit = (
    variables: UpdateNewProjectMutationVariables,
): Promise<UpdateNewProjectMutationResponse> =>
    commitMutation<UpdateNewProjectMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
