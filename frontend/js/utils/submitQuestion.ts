import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql'
// Easyfix: We should rely on __typename MultipleChoiceQuestion instead
const multipleChoiceQuestions = ['button', 'radio', 'select', 'checkbox', 'ranking']
export type QuestionsInReduxForm = ReadonlyArray<responsesHelper_adminQuestion>

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
})

export const submitQuestion = (questions: QuestionsInReduxForm) =>
  questions.filter(Boolean).map(question => {
    const questionInput = {
      question: {
        ...question,
        alwaysJumpDestinationQuestion: question.alwaysJumpDestinationQuestion
          ? question.alwaysJumpDestinationQuestion.id
          : null, // @ts-ignore
        rangeMax: question.rangeMax ? parseInt(question.rangeMax, 10) : undefined, // @ts-ignore
        rangeMin: question.rangeMin ? parseInt(question.rangeMin, 10) : undefined,
        jumps: question.jumps ? question.jumps.filter(Boolean).map(convertJump) : [],
        validationRule:
          question.validationRule && question.validationRule.type.length
            ? question.validationRule
            : question.__typename === 'MultipleChoiceQuestion'
            ? null
            : undefined,
        // Easyfix: this should be refactored
        otherAllowed: question.isOtherAllowed,
        isOtherAllowed: undefined,
        // List of not send properties to server
        __typename: undefined,
        kind: undefined,
        number: undefined,
        position: undefined,
        choices: undefined,
        destinationJumps: undefined,
      },
    }

    if (multipleChoiceQuestions.indexOf(question.type) !== -1 && typeof question.choices !== 'undefined') {
      questionInput.question.choices = question.choices
        ? // @ts-ignore
          question.choices.map(choice => ({
            ...choice,
            // We only send ids to the server
            image: choice.image ? choice.image.id : null,
            color: choice.color || null,
            // List of not send properties to server
            kind: undefined,
          }))
        : []
    }

    return questionInput
  })
