import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    CreateOauth2SSOConfigurationMutation,
    CreateOauth2SSOConfigurationMutationResponse,
    CreateOauth2SSOConfigurationMutationVariables,
} from '@relay/CreateOauth2SSOConfigurationMutation.graphql';
import uuid from '@utils/uuid';

const mutation = graphql`
    mutation CreateOauth2SSOConfigurationMutation(
        $input: CreateOauth2SSOConfigurationInput!
        $connections: [ID!]!
    ) @raw_response_type {
        createOauth2SSOConfiguration(input: $input) {
            ssoConfiguration
                @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
                id
                name
                enabled
                clientId
                secret
                authorizationUrl
                accessTokenUrl
                userInfoUrl
                logoutUrl
                profileUrl
            }
        }
    }
`;

const commit = (
    variables: CreateOauth2SSOConfigurationMutationVariables,
): Promise<CreateOauth2SSOConfigurationMutationResponse> =>
    commitMutation<CreateOauth2SSOConfigurationMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            createOauth2SSOConfiguration: {
                ssoConfiguration: {
                    id: `sso-openID-configuration-${uuid()}`,
                    name: variables.input.name,
                    enabled: true,
                    clientId: variables.input.clientId,
                    secret: variables.input.secret,
                    authorizationUrl: variables.input.authorizationUrl,
                    accessTokenUrl: variables.input.accessTokenUrl,
                    userInfoUrl: variables.input.userInfoUrl,
                    logoutUrl:
                        typeof variables.input.logoutUrl === 'undefined'
                            ? null
                            : variables.input.logoutUrl,
                    profileUrl:
                        typeof variables.input.logoutUrl === 'undefined'
                            ? null
                            : variables.input.logoutUrl,
                },
            },
        },
    });

export default { commit };
