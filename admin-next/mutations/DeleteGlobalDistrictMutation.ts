import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import type {
    DeleteGlobalDistrictMutation,
    DeleteGlobalDistrictMutationVariables,
    DeleteGlobalDistrictMutationResponse,
} from '@relay/DeleteGlobalDistrictMutation.graphql';

const mutation = graphql`
    mutation DeleteGlobalDistrictMutation($input: DeleteGlobalDistrictInput!) {
        deleteGlobalDistrict(input: $input) {
            deletedDistrictId @deleteRecord
        }
    }
`;

const commit = (
    variables: DeleteGlobalDistrictMutationVariables,
): Promise<DeleteGlobalDistrictMutationResponse> =>
    commitMutation<DeleteGlobalDistrictMutation>(environment, {
        mutation,
        variables,
        optimisticUpdater: store => {
            store.delete(variables.input.id);
        },
    });

export default { commit };
