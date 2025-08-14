// @ts-nocheck
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
    UpdateAnonymousReplyMutationVariables,
    UpdateAnonymousReplyMutationResponse,
} from '~relay/UpdateAnonymousReplyMutation.graphql';

const mutation = graphql`
    mutation UpdateAnonymousReplyMutation(
        $input: UpdateAnonymousReplyInput!
        $isAuthenticated: Boolean!
    ) {
        updateAnonymousReply(input: $input) {
            reply {
                id
                requirementsUrl
                ...ReplyForm_reply @arguments(isAuthenticated: $isAuthenticated)
                ...ReplyLink_reply @arguments(isAuthenticated: $isAuthenticated)
            }
            errorCode
        }
    }
`;

const commit = (
    variables: UpdateAnonymousReplyMutationVariables,
): Promise<UpdateAnonymousReplyMutationResponse> =>
    commitMutation(environment, {
        mutation,
        variables,
    });

export default {
    commit,
};
