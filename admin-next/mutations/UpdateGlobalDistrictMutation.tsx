import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateGlobalDistrictMutation,
    UpdateGlobalDistrictMutationVariables,
    UpdateGlobalDistrictMutationResponse,
} from '@relay/UpdateGlobalDistrictMutation.graphql';

const mutation = graphql`
    mutation UpdateGlobalDistrictMutation($input: UpdateGlobalDistrictInput!) {
        updateGlobalDistrict(input: $input) {
            districtEdge {
                cursor
                node {
                    id
                }
            }
        }
    }
`;

const commit = (
    variables: UpdateGlobalDistrictMutationVariables,
): Promise<UpdateGlobalDistrictMutationResponse> =>
    commitMutation<UpdateGlobalDistrictMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
