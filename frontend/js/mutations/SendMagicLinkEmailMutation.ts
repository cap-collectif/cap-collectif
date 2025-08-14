// @ts-nocheck
import { graphql, useMutation } from 'react-relay';
import type { SendMagicLinkEmailMutation } from '~relay/SendMagicLinkEmailMutation.graphql';

const mutation = graphql`
    mutation SendMagicLinkEmailMutation($input: SendMagicLinkEmailInput!) {
        sendMagicLinkEmail(input: $input) {
            errorCode
        }
    }
`;
export const useSendMagicLinkEmailMutation = () => {
    const [commit, isLoading] = useMutation<SendMagicLinkEmailMutation>(mutation);
    return {
        commit,
        isLoading,
    };
};
