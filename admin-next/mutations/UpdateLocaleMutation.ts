import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import {
    UpdateLocaleMutation,
    UpdateLocaleMutationResponse,
    UpdateLocaleMutationVariables,
} from '@relay/UpdateLocaleMutation.graphql';

const mutation = graphql`
    mutation UpdateLocaleMutation($input: UpdateLocaleInput!) {
        updateLocale(input: $input) {
            locale
        }
    }
`;

const commit = (
    variables: UpdateLocaleMutationVariables,
): Promise<UpdateLocaleMutationResponse> =>
    commitMutation<UpdateLocaleMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
