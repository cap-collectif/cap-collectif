import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import type {
    DeleteUserIdentificationCodeListMutation,
    DeleteUserIdentificationCodeListMutationResponse,
    DeleteUserIdentificationCodeListMutationVariables,
} from '@relay/DeleteUserIdentificationCodeListMutation.graphql';
import commitMutation from './commitMutation';

const mutation = graphql`
    mutation DeleteUserIdentificationCodeListMutation(
        $input: DeleteUserIdentificationCodeListInput!
    ) @raw_response_type {
        deleteUserIdentificationCodeList(input: $input) {
            deletedUserIdentificationCodeListId @deleteRecord
            errorCode
        }
    }
`;

const commit = (
    variables: DeleteUserIdentificationCodeListMutationVariables,
): Promise<DeleteUserIdentificationCodeListMutationResponse> => {
    return commitMutation<DeleteUserIdentificationCodeListMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            deleteUserIdentificationCodeList: {
                deletedUserIdentificationCodeListId: variables.input.id,
                errorCode: null,
            },
        },
        optimisticUpdater: store => {
            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');
            if (!viewer) return;

            const userIdentificationCodeLists = viewer.getLinkedRecord(
                'userIdentificationCodeLists',
                { first: 100 },
            );
            if (!userIdentificationCodeLists) return;

            const totalCount = Number(userIdentificationCodeLists.getValue('totalCount'));
            userIdentificationCodeLists.setValue(totalCount - 1, 'totalCount');
        },
        updater: store => {
            const payload = store.getRootField('deleteUserIdentificationCodeList');
            if (!payload) return;
            const errorCode = payload.getValue('errorCode');
            if (errorCode) return;

            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');
            if (!viewer) return;

            const userIdentificationCodeLists = viewer.getLinkedRecord(
                'userIdentificationCodeLists',
                { first: 100 },
            );
            if (!userIdentificationCodeLists) return;

            const totalCount = Number(userIdentificationCodeLists.getValue('totalCount'));
            userIdentificationCodeLists.setValue(totalCount - 1, 'totalCount');
        },
    });
};

export default { commit };
