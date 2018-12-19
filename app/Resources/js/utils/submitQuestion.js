// @flow
import type { responsesHelper_question } from './__generated__/responsesHelper_question.graphql';

// Easyfix: We should rely on __typename MultipleChoiceQuestion instead
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking'];

export type QuestionsInReduxForm = $ReadOnlyArray<responsesHelper_question>;

export const submitQuestion = (questions: QuestionsInReduxForm) =>
  // $FlowFixMe Missing type annotation for U.
  questions.filter(Boolean).map(question => {
    const questionInput = {
      question: {
        ...question,
        // Easyfix: this should be refactored
        otherAllowed: question.isOtherAllowed,
        isOtherAllowed: undefined,
        // List of not send properties to server
        kind: undefined,
        number: undefined,
        position: undefined,
        choices: undefined,
      },
    };
    if (
      multipleChoiceQuestions.indexOf(question.type) !== -1 &&
      typeof question.choices !== 'undefined'
    ) {
      questionInput.question.choices = question.choices
        ? question.choices.map(choice => ({
            ...choice,
            // We only send ids to the server
            image: choice.image ? choice.image.id : null,
            // List of not send properties to server
            kind: undefined,
          }))
        : [];

      // For now we can only jump fo multiple questions
      questionInput.question.jumps = question.jumps
        ? question.jumps.filter(Boolean).map(jump => ({
            ...jump,
            // We only send ids to the server
            origin: jump.origin ? parseInt(jump.origin.id, 10) : null,
            destination: jump.destination ? parseInt(jump.destination.id, 10) : null,
            conditions: jump.conditions
              ? jump.conditions.filter(Boolean).map(condition => ({
                  ...condition,
                  question: parseInt(condition.question.id, 10),
                  value: condition.value ? condition.value.id : null,
                }))
              : null,
          }))
        : [];
    }

    return questionInput;
  });
