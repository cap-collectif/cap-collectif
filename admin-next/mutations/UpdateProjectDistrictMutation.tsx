import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateProjectDistrictMutation,
    UpdateProjectDistrictMutationVariables,
    UpdateProjectDistrictMutationResponse,
} from '@relay/UpdateProjectDistrictMutation.graphql';

const mutation = graphql`
    mutation UpdateProjectDistrictMutation($input: UpdateProjectDistrictInput!) {
        updateProjectDistrict(input: $input) {
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
    variables: UpdateProjectDistrictMutationVariables,
): Promise<UpdateProjectDistrictMutationResponse> =>
    commitMutation<UpdateProjectDistrictMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
