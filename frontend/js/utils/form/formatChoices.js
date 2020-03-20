// @flow
import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql';

export const formatChoices = (
  questionnaire: QuestionnaireAdminConfigurationForm_questionnaire,
): any => {
  const questions = questionnaire.questions.map(question => {
    if (question.__typename !== 'MultipleChoiceQuestion') return question;
    const choices =
      question.choices && question.choices.edges
        ? question.choices.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
        : [];
    return { ...question, choices };
  });
  return { ...questionnaire, questions };
};

export default formatChoices;
