// @flow
import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql';

// Easyfix: We should rely on __typename MultipleChoiceQuestion instead
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking'];

export type QuestionsInReduxForm = $ReadOnlyArray<responsesHelper_adminQuestion>;

const convertJump = jump => ({
  id: jump.id,
  conditions:
    jump.conditions &&
    jump.conditions.filter(Boolean).map(condition => ({
      ...condition,
      question: condition.question.id,
      value: condition.value ? condition.value.id : null,
    })),
  origin: jump.origin.id,
  destination: jump.destination.id,
});

export const submitQuestion = (questions: QuestionsInReduxForm) =>
  // $FlowFixMe Missing type annotation for U.
  questions.filter(Boolean).map(question => {
    const questionInput = {
      question: {
        ...question,
        alwaysJumpDestinationQuestion:
          question.alwaysJumpDestinationQuestion ? question.alwaysJumpDestinationQuestion.id : null,
        jumps: question.jumps ? question.jumps.filter(Boolean).map(convertJump) : [],
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
    }

    return questionInput;
  });
