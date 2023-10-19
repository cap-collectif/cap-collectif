import { $Values } from 'utility-types'
import type { Jump, QuestionType } from '~/components/Form/Form.type'
import { OPERATOR } from '~/components/Form/Form.type'

export type JumpFormatted = {
  idJump: string
  destination: string
  questionsToValidate: Array<{
    id: string
    type: QuestionType
    value: string
    operator: $Values<typeof OPERATOR>
  }>
}

const mappingJumps = (jumps: ReadonlyArray<Jump>): Array<JumpFormatted> =>
  jumps.map(({ id, destination, conditions }) => {
    const resultJump = {
      idJump: id,
      destination: destination.id,
      questionsToValidate: [],
    }

    if (conditions && conditions.length > 0) {
      resultJump.questionsToValidate = conditions.map(({ question, value, operator }) => ({
        id: question.id,
        type: question.type,
        value: value.title,
        operator,
      }))
    }

    return resultJump
  })

export default mappingJumps
