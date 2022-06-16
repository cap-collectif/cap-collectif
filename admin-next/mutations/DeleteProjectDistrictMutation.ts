import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import type {
    DeleteProjectDistrictMutation,
    DeleteProjectDistrictMutationVariables,
    DeleteProjectDistrictMutationResponse,
} from '@relay/DeleteProjectDistrictMutation.graphql';

const mutation = graphql`
    mutation DeleteProjectDistrictMutation($input: DeleteProjectDistrictInput!) {
        deleteProjectDistrict(input: $input) {
            deletedDistrictId @deleteRecord
        }
    }
`;

const commit = (
    variables: DeleteProjectDistrictMutationVariables,
): Promise<DeleteProjectDistrictMutationResponse> =>
    commitMutation<DeleteProjectDistrictMutation>(environment, {
        mutation,
        variables,
        optimisticUpdater: store => {
            store.delete(variables.input.id);
        },
    });

export default { commit };
