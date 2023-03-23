import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateQuestionnaireStepMutation,
    UpdateQuestionnaireStepMutationResponse,
    UpdateQuestionnaireStepMutationVariables,
} from '@relay/UpdateQuestionnaireStepMutation.graphql';

const mutation = graphql`
    mutation UpdateQuestionnaireStepMutation($input: UpdateQuestionnaireStepInput!) {
        updateQuestionnaireStep(input: $input) {
            questionnaireStep {
                title
                label
                body
                timeRange {
                    startAt
                    endAt
                }
                enabled
                timeless
                isAnonymousParticipationAllowed
                metaDescription
                customCode

                questionnaire {
                    id
                    questions {
                        id
                        ...responsesHelper_adminQuestion
                    }
                }
                project {
                    adminAlphaUrl
                }
            }
        }
    }
`;

const commit = (
    variables: UpdateQuestionnaireStepMutationVariables,
): Promise<UpdateQuestionnaireStepMutationResponse> =>
    commitMutation<UpdateQuestionnaireStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
