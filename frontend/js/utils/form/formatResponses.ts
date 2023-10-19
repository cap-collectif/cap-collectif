import type {
  Question,
  Questions,
  QuestionType,
  ResponseInReduxForm,
  ResponsesInReduxForm,
} from '~/components/Form/Form.type'
import type { MultipleChoiceQuestionValidationRulesTypes } from '~relay/responsesHelper_question.graphql'
export type FormattedResponse = {
  idQuestion: string
  type: QuestionType
  value: (string | null | undefined) | (Array<string> | null | undefined)
  otherValue: string | null | undefined
  hidden?: boolean
  required: boolean
  validationRule?:
    | {
        readonly type: MultipleChoiceQuestionValidationRulesTypes
        readonly number: number
      }
    | null
    | undefined
  constraintes?:
    | {
        readonly isRangeBetween: boolean
        readonly rangeMin: number | null | undefined
        readonly rangeMax: number | null | undefined
      }
    | null
    | undefined
}

const formatResponses = (questions: Questions = [], responses: ResponsesInReduxForm = []): Array<FormattedResponse> =>
  responses.reduce((formattedResponses: Array<FormattedResponse>, response: ResponseInReduxForm) => {
    const { question: idQuestion, value } = response
    const questionOfResponse: Question | null | undefined = questions.find(q => q.id === idQuestion)

    if (!questionOfResponse) {
      return []
    }

    const { type, required, validationRule, isOtherAllowed, hidden, isRangeBetween, rangeMin, rangeMax } =
      questionOfResponse

    if (value) {
      let formattedValue: (string | null | undefined) | (Array<string> | null | undefined) = null
      let otherValue: string | null | undefined = null

      if (type === 'select' && value.value) {
        // @ts-expect-error
        formattedValue = value.value
      } else if ((type === 'checkbox' || type === 'radio') && value.labels) {
        // @ts-expect-error
        formattedValue = value.labels
        // @ts-expect-error
        otherValue = isOtherAllowed && value.other ? value.other : null
      } else if (type === 'ranking' || type === 'siren' || type === 'medias') {
        // @ts-expect-error
        formattedValue = value
      } else {
        // @ts-expect-error
        formattedValue = value
      }

      formattedResponses.push({
        idQuestion,
        type,
        value: formattedValue,
        hidden,
        otherValue,
        required,
        validationRule,
        constraintes: isRangeBetween
          ? {
              isRangeBetween,
              rangeMin,
              rangeMax,
            }
          : null,
      })
    } else {
      formattedResponses.push({
        idQuestion,
        type,
        value: null,
        hidden,
        otherValue: null,
        required,
        validationRule,
      })
    }

    return formattedResponses
  }, [])

export default formatResponses
