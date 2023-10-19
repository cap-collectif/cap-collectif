import type { IntlShape } from 'react-intl'
import type { Questions, ResponsesInReduxForm, ResponsesError, ResponsesWarning } from '~/components/Form/Form.type'
import stripHtml from '~/utils/stripHtml'
import formatResponses from '~/utils/form/formatResponses'
import type { FormattedResponse } from '~/utils/form/formatResponses'
import { checkOnlyNumbers, checkSiret, checkRNA } from '~/services/Validator'

const getResponseNumber = (
  value: (string | null | undefined) | (Array<string> | null | undefined),
  otherValue: string | null | undefined,
) => {
  if (Array.isArray(value) && value.length > 0) {
    const labelsNumber = value.length
    const hasOtherValue = otherValue ? 1 : 0
    return labelsNumber + hasOtherValue
  }

  return 0
}

// Error rule order by priority
export const validateResponses = (
  questions: Questions,
  responses: ResponsesInReduxForm,
  className: string,
  intl: IntlShape,
  isDraft: boolean = false,
  availableQuestionIds: Array<string> = [],
  async: boolean = false,
): {
  responses: ResponsesError | ResponsesWarning
} => {
  const formattedResponses: Array<FormattedResponse> = formatResponses(questions, responses)
  const responsesError = formattedResponses.map((formattedResponse: FormattedResponse) => {
    const { idQuestion, type, required, validationRule, value, otherValue, hidden, constraintes } = formattedResponse

    // required
    if (required && !isDraft && !hidden && !async) {
      // no value
      if (
        !value || // default
        (!value && !otherValue) || // checkbox & radio
        (value && value.length === 0 && !otherValue) || // checkbox & radio & ranking & media
        (type === 'editor' && typeof value === 'string' && !stripHtml(value)) // editor
      ) {
        return {
          idQuestion,
          value: `${className}.constraints.field_mandatory`,
        }
      }

      if (type === 'siret' && (!value || (typeof value === 'string' && !checkSiret(value)))) {
        return {
          idQuestion,
          value: `please-enter-a-siret`,
        }
      }

      if (type === 'rna' && (!value || (typeof value === 'string' && !checkRNA(value)))) {
        return {
          idQuestion,
          value: `please-enter-a-rna`,
        }
      }
    }

    if (type === 'majority') {
      const numberValue = Number(value)

      if (numberValue < 0 || numberValue > 5) {
        return {
          idQuestion,
          value: `valid-number-majority`,
        }
      }
    }

    if (type === 'number' && value && typeof value === 'string') {
      if (!checkOnlyNumbers(value)) {
        return {
          idQuestion,
          value: `please-enter-a-number`,
        }
      }

      if (checkOnlyNumbers(value) && constraintes?.isRangeBetween && async) {
        if (
          constraintes.rangeMin !== null &&
          typeof constraintes.rangeMin !== 'undefined' &&
          parseInt(value, 10) < parseInt(constraintes.rangeMin, 10)
        ) {
          return {
            idQuestion,
            value: `value-lower`,
          }
        }

        if (
          constraintes.rangeMax !== null &&
          typeof constraintes.rangeMax !== 'undefined' &&
          parseInt(value, 10) > parseInt(constraintes.rangeMax, 10)
        ) {
          return {
            idQuestion,
            value: `value-higher`,
          }
        }
      }
    }

    if (validationRule && ((value && value.length > 0) || otherValue) && !isDraft && !async) {
      const responsesNumber = getResponseNumber(value, otherValue)

      if (validationRule.type === 'MIN' && validationRule.number && responsesNumber < validationRule.number) {
        return {
          idQuestion,
          value: intl.formatMessage(
            {
              id: 'reply.constraints.choices_min',
            },
            {
              nb: validationRule.number,
            },
          ),
        }
      }

      if (validationRule.type === 'MAX' && validationRule.number && responsesNumber > validationRule.number) {
        return {
          idQuestion,
          value: intl.formatMessage(
            {
              id: 'reply.constraints.choices_max',
            },
            {
              nb: validationRule.number,
            },
          ),
        }
      }

      if (validationRule.type === 'EQUAL' && responsesNumber !== validationRule.number) {
        return {
          idQuestion,
          value: intl.formatMessage(
            {
              id: 'reply.constraints.choices_equal',
            },
            {
              nb: validationRule.number,
            },
          ),
        }
      }
    }
  })

  /**
   * undefined is necessary here to display an error to the right question in order of the form
   * so an undefined correspond to one question with no error
   */
  const responsesErrorAvailableQuestions: ResponsesError = responsesError.map(error =>
    error && availableQuestionIds.includes(error.idQuestion)
      ? {
          value: error.value,
        }
      : undefined,
  )
  return responsesErrorAvailableQuestions?.length > 0
    ? {
        responses: responsesErrorAvailableQuestions,
      }
    : {}
}
export default validateResponses
