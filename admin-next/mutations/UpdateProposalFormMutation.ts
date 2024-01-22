import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import {
    UpdateProposalFormMutation,
    UpdateProposalFormMutationResponse,
    UpdateProposalFormMutationVariables,
} from '@relay/UpdateProposalFormMutation.graphql';

const mutation = graphql`
    mutation UpdateProposalFormMutation($input: UpdateProposalFormInput!) {
        updateProposalForm(input: $input) {
            proposalForm {
                id
                title
            }
        }
    }
`;

const commit = (
    variables: UpdateProposalFormMutationVariables,
): Promise<UpdateProposalFormMutationResponse> =>
    commitMutation<UpdateProposalFormMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
