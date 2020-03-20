// @flow
import type { FormattedQuestion } from '~/utils/form/formatQuestions';

/*
  4 cases here (in order):
  - One question with jumps validated
  - One question with jumps not validated then display alwaysJump
  - One question not linked to any jumps
  - One question linked to a jump but not display 'cause doesn't respect condition
*/

const getAvailableQuestions = (
  id: string,
  questions: Array<FormattedQuestion>,
  availableQuestions: Array<string> = [],
  questionsNotValidate: Array<string> = [],
): Array<string> => {
  // use recursive to follow the order of the questionnaire and not the order of array
  const indexCurrentQuestion = questions.findIndex(q => q.id === id);
  const currentQuestion = questions[indexCurrentQuestion];
  const { questionsToDisplay, id: idCurrentQuestion, questionsNotDisplay } = currentQuestion;

  // First of all: Add questions not display
  if (questionsNotDisplay && questionsNotDisplay.length > 0) {
    questionsNotValidate = [...questionsNotValidate, ...questionsNotDisplay];
    questionsNotValidate = [...new Set(questionsNotValidate)];
  }

  if (questionsToDisplay && questionsToDisplay.length > 0 && !questionsNotValidate.includes(id)) {
    availableQuestions = [...availableQuestions, idCurrentQuestion];

    if (questionsToDisplay.length > 1) {
      let multipleAvailableQuestions = [];

      questionsToDisplay.forEach((q, index) => {
        /**
         * keep pass 'availableQuestions' as parameter to keep the same base of questions
         * (and not 'multipleAvailableQuestions')
         * Then we will get as many possibilities as condition validated
         */
        multipleAvailableQuestions = [
          ...multipleAvailableQuestions,
          getAvailableQuestions(q, questions, availableQuestions, questionsNotValidate),
        ];

        // fusion all different case on last iteration
        if (index === questionsToDisplay.length - 1) {
          multipleAvailableQuestions = multipleAvailableQuestions.reduce(
            (acc, item) => acc.concat(item),
            [],
          );
        }
      });

      return [...new Set(multipleAvailableQuestions)];
    }

    availableQuestions = [...availableQuestions, questionsToDisplay[0]];

    // go test alwaysJump question
    return getAvailableQuestions(
      questionsToDisplay[0],
      questions,
      availableQuestions,
      questionsNotValidate,
    );
  }

  // loop to search next question
  for (let i = indexCurrentQuestion + 1; i < questions.length; i++) {
    const nextQuestion = questions[i];

    if (nextQuestion) {
      const isNotValidate = questionsNotValidate.includes(nextQuestion.id);
      let hasOneParentValidate = false;

      const allParents: Array<FormattedQuestion> = questions.filter(q =>
        q.questionsToDisplay.includes(nextQuestion.id),
      );

      if (allParents.length > 0) {
        questionsNotValidate = [...new Set(questionsNotValidate)];

        // eslint-disable-next-line no-loop-func
        hasOneParentValidate = allParents.some((parent: FormattedQuestion) => {
          return availableQuestions.includes(parent.id);
        });
      } else {
        hasOneParentValidate = true;
      }

      // no logic question THEN display next one
      if (!isNotValidate && hasOneParentValidate) {
        availableQuestions = [...availableQuestions, idCurrentQuestion];

        return getAvailableQuestions(
          nextQuestion.id,
          questions,
          availableQuestions,
          questionsNotValidate,
        );
      }
      if (isNotValidate) {
        questionsNotValidate = [
          ...questionsNotValidate,
          ...nextQuestion.questionsToDisplay,
          ...nextQuestion.questionsNotDisplay,
          nextQuestion.id,
        ];
      }
    }
  }

  // Add other independent questions of any jumps
  const simpleQuestions: Array<string> = questions
    .filter((q: FormattedQuestion) => {
      const isNotValidate = questionsNotValidate.includes(q.id);
      const isAlreadyDisplay = availableQuestions.includes(q.id);

      const isNotToDisplay = questions.some(
        formattedQuestion =>
          (formattedQuestion.questionsNotDisplay &&
            formattedQuestion.questionsNotDisplay.includes(q.id)) ||
          (formattedQuestion.questionsToDisplay &&
            formattedQuestion.questionsToDisplay.includes(q.id)),
      );

      return !isNotValidate && !isNotToDisplay && !isAlreadyDisplay;
    })
    .map(q => q.id);

  return [...availableQuestions, ...simpleQuestions, idCurrentQuestion];
};

export default getAvailableQuestions;
