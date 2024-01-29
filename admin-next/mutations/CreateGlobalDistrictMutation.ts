import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    CreateGlobalDistrictMutation,
    CreateGlobalDistrictMutationVariables,
    CreateGlobalDistrictMutationResponse,
} from '@relay/CreateGlobalDistrictMutation.graphql';

const mutation = graphql`
    mutation CreateGlobalDistrictMutation($input: CreateGlobalDistrictInput!) {
        createGlobalDistrict(input: $input) {
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
    variables: CreateGlobalDistrictMutationVariables,
): Promise<CreateGlobalDistrictMutationResponse> =>
    commitMutation<CreateGlobalDistrictMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
