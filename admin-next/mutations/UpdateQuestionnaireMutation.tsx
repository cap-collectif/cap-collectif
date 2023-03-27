import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateQuestionnaireMutation,
    UpdateQuestionnaireMutationVariables,
    UpdateQuestionnaireMutationResponse,
} from '@relay/UpdateQuestionnaireMutation.graphql';

const mutation = graphql`
    mutation UpdateQuestionnaireMutation($input: UpdateQuestionnaireConfigurationInput!) {
        updateQuestionnaireConfiguration(input: $input) {
            questionnaire {
                id
                title
                description
                questions {
                    id
                    ...responsesHelper_adminQuestion @relay(mask: false)
                }
            }
        }
    }
`;

const commit = (
    variables: UpdateQuestionnaireMutationVariables,
): Promise<UpdateQuestionnaireMutationResponse> =>
    commitMutation<UpdateQuestionnaireMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
