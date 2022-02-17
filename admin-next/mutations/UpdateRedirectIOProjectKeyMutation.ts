import { graphql } from 'react-relay';
import { environment } from '@utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateRedirectIOProjectKeyMutationVariables,
    UpdateRedirectIOProjectKeyMutationResponse,
} from '~relay/UpdateRedirectIOProjectKeyMutation.graphql';

const mutation = graphql`
    mutation UpdateRedirectIOProjectKeyMutation($input: UpdateRedirectIOProjectIdInput!) {
        updateRedirectIOKey(input: $input) {
            projectId
        }
    }
`;

const commit = (
    variables: UpdateRedirectIOProjectKeyMutationVariables,
): Promise<UpdateRedirectIOProjectKeyMutationResponse> =>
    commitMutation(environment, {
        mutation,
        variables,
    });

export default { commit };
