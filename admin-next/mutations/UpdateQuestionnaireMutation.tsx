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
                questionsWithJumps: questions(filter: JUMPS_ONLY) {
                    id
                    title
                    jumps(orderBy: { field: POSITION, direction: ASC }) {
                        id
                        origin {
                            id
                            title
                        }
                        destination {
                            id
                            title
                            number
                        }
                        conditions {
                            id
                            operator
                            question {
                                id
                                title
                                type
                            }
                            ... on MultipleChoiceQuestionLogicJumpCondition {
                                value {
                                    id
                                    title
                                }
                            }
                        }
                    }
                    # unused for now, will be usefull when we'll add error and warning messages
                    destinationJumps {
                        id
                        origin {
                            id
                            title
                        }
                    }

                    alwaysJumpDestinationQuestion {
                        id
                        title
                        number
                    }
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
