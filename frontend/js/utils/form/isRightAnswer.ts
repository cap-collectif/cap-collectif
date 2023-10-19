import { $Values } from 'utility-types'
import type { QuestionType } from '~/components/Form/Form.type'
import { OPERATOR } from '~/components/Form/Form.type'

const isRightAnswer = (
  rightAnswer: string,
  userResponse: (string | null | undefined) | (Array<string> | null | undefined),
  questionType: QuestionType,
  operatorType: $Values<typeof OPERATOR>,
) => {
  // no response from user
  if (!userResponse || userResponse.length === 0) {
    return false
  }

  // response of question type => checkbox | radio | ranking
  if (Array.isArray(userResponse)) {
    return operatorType === OPERATOR.IS ? userResponse.includes(rightAnswer) : !userResponse.includes(rightAnswer)
  }

  return operatorType === OPERATOR.IS ? userResponse === rightAnswer : userResponse !== rightAnswer
}

export default isRightAnswer
