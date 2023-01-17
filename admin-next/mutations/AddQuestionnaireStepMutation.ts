import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddQuestionnaireStepMutation,
    AddQuestionnaireStepMutationVariables,
    AddQuestionnaireStepMutationResponse,
} from '@relay/AddQuestionnaireStepMutation.graphql';

const mutation = graphql`
    mutation AddQuestionnaireStepMutation($input: AddStepInput!) {
        addQuestionnaireStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddQuestionnaireStepMutationVariables,
): Promise<AddQuestionnaireStepMutationResponse> =>
    commitMutation<AddQuestionnaireStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
