import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import {
    DeleteUserIdentificationCodeListMutationResponse,
    DeleteUserIdentificationCodeListMutationVariables,
} from '@relay/DeleteUserIdentificationCodeListMutation.graphql';
import commitMutation from './commitMutation';

const mutation = graphql`
    mutation DeleteUserIdentificationCodeListMutation(
        $input: DeleteUserIdentificationCodeListInput!
    ) {
        deleteUserIdentificationCodeList(input: $input) {
            id @deleteRecord
            errorCode
        }
    }
`;

const commit = (
    variables: DeleteUserIdentificationCodeListMutationVariables,
): Promise<DeleteUserIdentificationCodeListMutationResponse> => {
    return commitMutation(environment, {
        mutation,
        variables,
    });
};

export default { commit };
