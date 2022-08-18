import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    CreateProjectDistrictMutation,
    CreateProjectDistrictMutationVariables,
    CreateProjectDistrictMutationResponse,
} from '@relay/CreateProjectDistrictMutation.graphql';

const mutation = graphql`
    mutation CreateProjectDistrictMutation($input: CreateProjectDistrictInput!) {
        createProjectDistrict(input: $input) {
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
    variables: CreateProjectDistrictMutationVariables,
): Promise<CreateProjectDistrictMutationResponse> =>
    commitMutation<CreateProjectDistrictMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
