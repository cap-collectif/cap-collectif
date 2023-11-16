import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddVoteAndSelectionStepMutation,
    AddVoteAndSelectionStepMutationVariables,
    AddVoteAndSelectionStepMutationResponse,
} from '@relay/AddVoteAndSelectionStepMutation.graphql';

const mutation = graphql`
    mutation AddVoteAndSelectionStepMutation($input: AddStepInput!) {
        addVoteAndSelectionStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddVoteAndSelectionStepMutationVariables,
): Promise<AddVoteAndSelectionStepMutationResponse> =>
    commitMutation<AddVoteAndSelectionStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
