import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import {
    CreateUserIdentificationCodeListMutationResponse,
    CreateUserIdentificationCodeListMutationVariables,
} from '@relay/CreateUserIdentificationCodeListMutation.graphql';

const mutation = graphql`
    mutation CreateUserIdentificationCodeListMutation(
        $input: CreateUserIdentificationCodeListInput!
        $connections: [ID!]!
        $edgeTypeName: String!
    ) {
        createUserIdentificationCodeList(input: $input) {
            userIdentificationCodeList
                @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
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
    return commitMutation(environment, {
        mutation,
        variables,
    });
};

export default { commit };
