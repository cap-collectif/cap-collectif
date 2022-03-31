import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateCASSSOConfigurationMutation,
    UpdateCASSSOConfigurationMutationResponse,
    UpdateCASSSOConfigurationMutationVariables,
} from '@relay/UpdateCASSSOConfigurationMutation.graphql';

const mutation = graphql`
    mutation UpdateCASSSOConfigurationMutation($input: UpdateCASSSOConfigurationInput!)
    @raw_response_type {
        updateCASSSOConfiguration(input: $input) {
            ssoConfiguration {
                id
                name
                casVersion
                casServerUrl
                casCertificate
            }
        }
    }
`;

const commit = (
    variables: UpdateCASSSOConfigurationMutationVariables,
): Promise<UpdateCASSSOConfigurationMutationResponse> =>
    commitMutation<UpdateCASSSOConfigurationMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            updateCASSSOConfiguration: {
                ssoConfiguration: {
                    id: variables.input.id,
                    name: variables.input.name,
                    casVersion: variables.input.casVersion,
                    casServerUrl: variables.input.casServerUrl,
                    casCertificate: variables.input.casCertificate,
                },
            },
        },
    });

export default { commit };
