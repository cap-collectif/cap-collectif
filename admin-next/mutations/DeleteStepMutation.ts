import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteStepMutation,
    DeleteStepMutationResponse,
    DeleteStepMutationVariables,
} from '@relay/DeleteStepMutation.graphql';

const mutation = graphql`
    mutation DeleteStepMutation($input: DeleteStepInput!)
    {
        deleteStep(input: $input) {
            stepId
        }    
    }
`;

const commit = (
    variables: DeleteStepMutationVariables,
): Promise<DeleteStepMutationResponse> =>
    commitMutation<DeleteStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
