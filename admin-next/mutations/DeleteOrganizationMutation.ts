import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import {
    DeleteOrganizationMutation,
    DeleteOrganizationMutationResponse,
    DeleteOrganizationMutationVariables,
} from '@relay/DeleteOrganizationMutation.graphql';

const mutation = graphql`
    mutation DeleteOrganizationMutation($input: DeleteOrganizationInput!) {
        deleteOrganization(input: $input) {
            deletedOrganization {
                title
                slug
                body
                banner {
                    url
                }
                logo {
                    url
                }
                members {
                    edges {
                        node {
                            user {
                                username
                            }
                        }
                    }
                }
                socialNetworks {
                    webPageUrl
                    facebookUrl
                    twitterUrl
                    youtubeUrl
                    linkedInUrl
                    instagramUrl
                }
            }
            errorCode
        }
    }
`;

const commit = (
    variables: DeleteOrganizationMutationVariables,
): Promise<DeleteOrganizationMutationResponse> =>
    commitMutation<DeleteOrganizationMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
