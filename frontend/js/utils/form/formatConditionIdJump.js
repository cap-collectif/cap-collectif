// @flow
import getIsRightAnswer from '~/utils/form/isRightAnswer';
import type { FormattedResponse } from '~/utils/form/formatResponses';
import type { JumpFormatted } from '~/utils/form/mappingJumps';

export type ConditionFormatted = {|
  destination: string,
  isValidated: boolean,
|};

export type ConditionsFormatted = {|
  [string]: ConditionFormatted,
|};

const formatConditionToIdJump = (
  jumps: Array<JumpFormatted>,
  responses: Array<FormattedResponse>,
): ConditionsFormatted | $Shape<{||}> => {
  /**
   * Conditions formatted like :
   *
   * [
   *  {
   *    idJump,
   *    destination,
   *    questionsToValidate: [
   *      {
   *        id: idQuestion,
   *        value,
   *        type,
   *        operator: 'IS' | 'IS_NOT'
   *      }
   *    ]
   *  }
   * ]
   */

  const result = jumps.map((jump: JumpFormatted) => {
    responses.forEach((response: FormattedResponse) => {
      const indexQuestionToValidateCurrentCondition = jump.questionsToValidate.findIndex(
        q => q.id === response.idQuestion,
      );

      const questionToValidateCurrentCondition =
        jump.questionsToValidate[indexQuestionToValidateCurrentCondition];

      const isRightAnswer =
        indexQuestionToValidateCurrentCondition > -1 &&
        getIsRightAnswer(
          questionToValidateCurrentCondition.value,
          response.value,
          questionToValidateCurrentCondition.type,
          questionToValidateCurrentCondition.operator,
        );

      // delete question from question to validate when response is the right value
      if (indexQuestionToValidateCurrentCondition > -1 && isRightAnswer) {
        jump.questionsToValidate.splice(indexQuestionToValidateCurrentCondition, 1);
      }
    });

    return jump;
  });

  /**
   * We formatted conditions like :
   *
   * [idJump]: {
   *  destination: string,
   *  isValidated: boolean
   * }
   *
   */
  return result.reduce(
    (global: ConditionsFormatted | $Shape<{||}>, item) => ({
      ...global,
      [item.idJump]: {
        destination: item.destination,
        isValidated: item.questionsToValidate.length === 0,
      },
    }),
    {},
  );
};

export default formatConditionToIdJump;
