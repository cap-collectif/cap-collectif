import type { IntlShape } from 'react-intl'
import type { Questions, ResponsesInReduxForm, ResponsesWarning } from '~/components/Form/Form.type'
import validateResponses from '~/utils/form/validateResponses'

export const warnResponses = (
  questions: Questions,
  responses: ResponsesInReduxForm,
  className: string,
  intl: IntlShape,
): {
  responses: ResponsesWarning
} => validateResponses(questions, responses, className, intl, true)
export default warnResponses
