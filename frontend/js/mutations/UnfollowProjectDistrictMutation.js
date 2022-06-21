// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
    UnfollowProjectDistrictMutationVariables,
    UnfollowProjectDistrictMutationResponse,
} from '~relay/UnfollowProjectDistrictMutation.graphql';

const mutation = graphql`
    mutation UnfollowProjectDistrictMutation($input: UnfollowProjectDistrictInput!) {
        unfollowProjectDistrict(input: $input) {
            projectDistrict {
                id
                followers {
                    totalCount
                    edges {
                        node {
                            username
                        }
                    }
                }
            }
        }
    }
`;

const commit = (
    variables: UnfollowProjectDistrictMutationVariables,
): Promise<UnfollowProjectDistrictMutationResponse> =>
    commitMutation(environnement, {
        mutation,
        variables,
    });

export default { commit };
