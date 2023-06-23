import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateProjectSlugMutation,
    UpdateProjectSlugMutationVariables,
    UpdateProjectSlugMutationResponse,
} from '@relay/UpdateProjectSlugMutation.graphql';

const mutation = graphql`
    mutation UpdateProjectSlugMutation($input: UpdateProjectSlugInput!) {
        updateProjectSlug(input: $input) {
            project {
                id
                url
                slug
            }
            errorCode
        }
    }
`;

const commit = (
    variables: UpdateProjectSlugMutationVariables,
): Promise<UpdateProjectSlugMutationResponse> =>
    commitMutation<UpdateProjectSlugMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
