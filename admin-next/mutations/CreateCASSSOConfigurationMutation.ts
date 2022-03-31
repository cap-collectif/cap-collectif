import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    CreateCASSSOConfigurationMutation,
    CreateCASSSOConfigurationMutationResponse,
    CreateCASSSOConfigurationMutationVariables,
} from '@relay/CreateCASSSOConfigurationMutation.graphql';
import uuid from '@utils/uuid';

const mutation = graphql`
    mutation CreateCASSSOConfigurationMutation(
        $input: CreateCASSSOConfigurationInput!
        $connections: [ID!]!
    ) @raw_response_type {
        createCASSSOConfiguration(input: $input) {
            ssoConfiguration
                @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
                id
                name
                enabled
                casVersion
                casServerUrl
                casCertificate
            }
        }
    }
`;

const commit = (
    variables: CreateCASSSOConfigurationMutationVariables,
): Promise<CreateCASSSOConfigurationMutationResponse> =>
    commitMutation<CreateCASSSOConfigurationMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            createCASSSOConfiguration: {
                ssoConfiguration: {
                    id: `sso-openID-configuration-${uuid()}`,
                    name: variables.input.name,
                    enabled: true,
                    casVersion: variables.input.casVersion,
                    casServerUrl: variables.input.casServerUrl,
                    casCertificate: variables.input.casCertificate,
                },
            },
        },
    });

export default { commit };
