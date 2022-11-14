import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import {
    UpdateOrganizationMutation,
    UpdateOrganizationMutationResponse,
    UpdateOrganizationMutationVariables,
} from '@relay/UpdateOrganizationMutation.graphql';

const mutation = graphql`
    mutation UpdateOrganizationMutation($input: UpdateOrganizationInput!) {
        updateOrganization(input: $input) {
            organization {
                title
                body
                logo {
                    url
                }
                banner {
                    url
                }
                socialNetworks {
                    facebookUrl
                    webPageUrl
                    twitterUrl
                    instagramUrl
                    linkedInUrl
                    youtubeUrl
                }
            }
        }
    }
`;

const commit = (
    variables: UpdateOrganizationMutationVariables,
): Promise<UpdateOrganizationMutationResponse> =>
    commitMutation<UpdateOrganizationMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
