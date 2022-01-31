import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteSSOConfigurationMutation,
    DeleteSSOConfigurationMutationResponse,
    DeleteSSOConfigurationMutationVariables,
} from '@relay/DeleteSSOConfigurationMutation.graphql';

const mutation = graphql`
    mutation DeleteSSOConfigurationMutation($input: DeleteSSOConfigurationInput!)
    @raw_response_type {
        deleteSSOConfiguration(input: $input) {
            deletedSsoConfigurationId @deleteRecord
        }
    }
`;

const commit = (
    variables: DeleteSSOConfigurationMutationVariables,
): Promise<DeleteSSOConfigurationMutationResponse> =>
    commitMutation<DeleteSSOConfigurationMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            deleteSSOConfiguration: {
                deletedSsoConfigurationId: variables.input.id,
            },
        },
    });

export default { commit };
