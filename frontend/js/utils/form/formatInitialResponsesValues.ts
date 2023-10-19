import type { Questions, ResponsesFromAPI, ResponsesInReduxForm } from '~/components/Form/Form.type'
import getValueFromResponse from '~/utils/form/getValueFromResponse'

export const formatInitialResponsesValues = (questions: Questions, responses: ResponsesFromAPI): ResponsesInReduxForm =>
  questions.map(question => {
    const response = responses.filter(res => res && res.question.id === question.id)[0]
    const questionId = question.id

    // If there is a response, format it
    if (response) {
      // TODO: response.value !== "null" is a hotfix, related to issue https://github.com/cap-collectif/platform/issues/6214
      // because of a weird bug, causing answer with questions set to "null" instead of NULL in db
      if (typeof response.value !== 'undefined' && response.value !== null && response.value !== 'null') {
        return {
          question: questionId,
          value: getValueFromResponse(question.type, response.value),
        }
      }

      if (typeof response.medias !== 'undefined') {
        return {
          question: questionId,
          value: response.medias,
        }
      }
    }

    // Otherwise we create an empty response
    if (question.type === 'medias' || question.type === 'ranking') {
      return {
        question: questionId,
        value: [],
      }
    }

    if (question.type === 'radio' || question.type === 'checkbox') {
      return {
        question: questionId,
        value: {
          labels: [],
          other: null,
        },
      }
    }

    return {
      question: questionId,
      value: null,
    }
  })
export default formatInitialResponsesValues
