import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateOauth2SSOConfigurationMutation,
    UpdateOauth2SSOConfigurationMutationResponse,
    UpdateOauth2SSOConfigurationMutationVariables,
} from '@relay/UpdateOauth2SSOConfigurationMutation.graphql';

const mutation = graphql`
    mutation UpdateOauth2SSOConfigurationMutation($input: UpdateOauth2SSOConfigurationInput!)
    @raw_response_type {
        updateOauth2SSOConfiguration(input: $input) {
            ssoConfiguration {
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
    variables: UpdateOauth2SSOConfigurationMutationVariables,
): Promise<UpdateOauth2SSOConfigurationMutationResponse> =>
    commitMutation<UpdateOauth2SSOConfigurationMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            updateOauth2SSOConfiguration: {
                ssoConfiguration: {
                    id: variables.input.id,
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
