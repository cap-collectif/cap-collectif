// @flow
import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql';

// Easyfix: We should rely on __typename MultipleChoiceQuestion instead
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking'];

export type QuestionsInReduxForm = $ReadOnlyArray<responsesHelper_adminQuestion & { alwaysJump: ?string }>;

const convertJump = jump => ({
  id: jump.id,
  always: jump.always,
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
        // We create here an always jump (similar to an "else" case) but to keep consistency
        // with back-end, it's the same form as a normal logic jump, but the only difference is
        // that it has an empty array of condition, and an "always" parameter defined to true
        jumps: !question.alwaysJump
          ? question.jumps &&
            question.jumps
              .filter(Boolean)
              .filter(jump => !jump.always)
              .map(convertJump)
          : question.jumps && question.jumps.find(jump => jump && jump.always)
          ? question.jumps &&
            question.jumps
              .filter(Boolean)
              .map(convertJump)
              .map(jump => ({
                ...jump,
                destination: jump.always ? question.alwaysJump : jump.destination,
              }))
          : [
              ...(question.jumps
                ? question.jumps
                    .filter(Boolean)
                    .filter(jump => !jump.always)
                    .map(convertJump)
                : []),
              {
                always: true,
                conditions: [],
                origin: question.id,
                destination: question.alwaysJump,
              },
            ],
        // Easyfix: this should be refactored
        otherAllowed: question.isOtherAllowed,
        isOtherAllowed: undefined,
        // List of not send properties to server
        kind: undefined,
        number: undefined,
        position: undefined,
        choices: undefined,
        alwaysJump: undefined,
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
