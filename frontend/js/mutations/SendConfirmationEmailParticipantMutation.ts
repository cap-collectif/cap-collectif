// @ts-nocheck
import { graphql, useMutation } from 'react-relay';
import type { SendConfirmationEmailParticipantMutation } from '~relay/SendConfirmationEmailParticipantMutation.graphql';

const mutation = graphql`
    mutation SendConfirmationEmailParticipantMutation(
        $input: SendConfirmationEmailParticipantInput!
    ) {
        sendConfirmationEmailParticipant(input: $input) {
            errorCode
        }
    }
`;
export const useSendConfirmationEmailParticipantMutation = () => {
    const [commit, isLoading] = useMutation<SendConfirmationEmailParticipantMutation>(mutation);
    return {
        commit,
        isLoading
    }
};
