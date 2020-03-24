// @flow
import mappingJumps from '~/utils/form/mappingJumps';
import formatConditionToIdJump from '~/utils/form/formatConditionIdJump';
import type { Questions } from '~/components/Form/Form.type';
import type { FormattedResponse } from '~/utils/form/formatResponses';

export type FormattedQuestion = {|
  id: string,
  title: string,
  questionsToDisplay: Array<string>,
  questionsNotDisplay: Array<string>,
|};

const formatQuestions = (
  questions: Questions,
  formattedResponses: Array<FormattedResponse>,
): Array<FormattedQuestion> =>
  questions.map(({ id, title, alwaysJumpDestinationQuestion, jumps }) => {
    const question = {
      id,
      title,
      questionsToDisplay: [],
      questionsNotDisplay: [],
    };

    // simple case: IF no jumps no alwaysJump THEN nothing to display
    if (jumps && jumps.length === 0 && !alwaysJumpDestinationQuestion) {
      question.questionsToDisplay = [];
    }

    // alwaysJump case: IF no jumps but has alwaysJump THEN display alwaysJump
    if (jumps && jumps.length === 0 && alwaysJumpDestinationQuestion) {
      question.questionsToDisplay = [alwaysJumpDestinationQuestion.id];
    }

    // jumps case: IF alwaysJump and jumps THEN display questions link to condition validated
    if (jumps && jumps.length > 0) {
      const jumpsFormatted = mappingJumps(jumps);
      const conditionsFormatted = formatConditionToIdJump(jumpsFormatted, formattedResponses);
      const response = formattedResponses.find(r => id === r.idQuestion);
      const hasResponse = response
        ? Array.isArray(response?.value)
          ? response.value.length > 0
          : !!response.value
        : false;

      let hasOneJumpValidated = false;

      question.questionsToDisplay = [];
      question.questionsNotDisplay = [];

      jumps.forEach(jump => {
        const conditionsOfJumpQuestion = conditionsFormatted[jump.id];

        if (conditionsOfJumpQuestion.isValidated) {
          hasOneJumpValidated = true;

          // Display only one questions destination link to condition validated
          // Then add others in not display
          if (question.questionsToDisplay.length === 0) {
            question.questionsToDisplay = [conditionsOfJumpQuestion.destination];
          } else {
            question.questionsNotDisplay = [
              ...question.questionsNotDisplay,
              conditionsOfJumpQuestion.destination,
            ];
          }
        } else {
          // Never display destination question of condition not validated
          question.questionsNotDisplay = [
            ...question.questionsNotDisplay,
            conditionsOfJumpQuestion.destination,
          ];
        }
      });

      // no right answer FOR jumps BUT has an answer THEN display "in other cases jump to"
      // "in other cases jump to" is when a question has jumps and an alwaysJump
      if (alwaysJumpDestinationQuestion && !hasOneJumpValidated && hasResponse) {
        question.questionsToDisplay = [alwaysJumpDestinationQuestion.id];
      } else if (
        alwaysJumpDestinationQuestion &&
        (hasOneJumpValidated || (!hasResponse && !hasOneJumpValidated))
      ) {
        question.questionsNotDisplay = [
          ...question.questionsNotDisplay,
          alwaysJumpDestinationQuestion.id,
        ];
      }
    }

    return question;
  });

export default formatQuestions;
