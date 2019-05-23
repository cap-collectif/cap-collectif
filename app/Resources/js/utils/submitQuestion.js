// @flow
import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql';

// Easyfix: We should rely on __typename MultipleChoiceQuestion instead
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking'];

export type QuestionsInReduxForm = $ReadOnlyArray<responsesHelper_adminQuestion & { alwaysJump: ?string }>;

export const submitQuestion = (questions: QuestionsInReduxForm) =>
  // $FlowFixMe Missing type annotation for U.
  questions.filter(Boolean).map(question => {
    const questionInput = {
      question: {
        ...question,
        jumps: question.jumps.filter(jump => jump && !jump.always),
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
    if (question.alwaysJump) {
      questionInput.question.jumps.unshift(
        { always: true, conditions: [], origin: { id: question.id }, destination: { id: question.alwaysJump } }
      )
    }
    console.log(questionInput);
    // We do not need to send this to the server. The always jump (if defined) is instead pushed into
    // the jumps property, so we keep the same behaviour on the back-end
    delete questionInput.question.alwaysJump;
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
      questionInput.question.jumps = questionInput.question.jumps
        ? questionInput.question.jumps.filter(Boolean).map(jump => ({
          ...jump,
          // We only send ids to the server
          origin: jump.origin ? jump.origin.id : null,
          destination: jump.destination ? jump.destination.id : null,
          conditions: jump.conditions
            ? jump.conditions.filter(Boolean).map(condition => ({
              ...condition,
              question: condition.question.id,
              value: condition.value ? condition.value.id : null,
            }))
            : null,
        }))
        : [];
    }

    return questionInput;
  })
;
