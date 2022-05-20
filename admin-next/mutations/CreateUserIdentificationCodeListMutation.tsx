import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import type {
    CreateUserIdentificationCodeListMutation,
    CreateUserIdentificationCodeListMutationResponse,
    CreateUserIdentificationCodeListMutationVariables,
} from '@relay/CreateUserIdentificationCodeListMutation.graphql';

const mutation = graphql`
    mutation CreateUserIdentificationCodeListMutation(
        $input: CreateUserIdentificationCodeListInput!
        $connections: [ID!]!
    ) {
        createUserIdentificationCodeList(input: $input) {
            userIdentificationCodeList
                @appendNode(connections: $connections, edgeTypeName: "UserIdentificationCodeList") {
                id
                name
                codesCount
                alreadyUsedCount
            }
        }
    }
`;

const commit = (
    variables: CreateUserIdentificationCodeListMutationVariables,
): Promise<CreateUserIdentificationCodeListMutationResponse> => {
    return commitMutation<CreateUserIdentificationCodeListMutation>(environment, {
        mutation,
        variables,
        updater: store => {
            const payload = store.getRootField('createUserIdentificationCodeList');
            if (!payload) return;

            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');

            if (!viewer) return;

            const userIdentificationCodeLists = viewer.getLinkedRecord(
                'userIdentificationCodeLists',
                { first: 100 },
            );

            if (!userIdentificationCodeLists) return;

            const totalCount = Number(userIdentificationCodeLists.getValue('totalCount'));
            userIdentificationCodeLists.setValue(totalCount + 1, 'totalCount');
        },
    });
};

export default { commit };
