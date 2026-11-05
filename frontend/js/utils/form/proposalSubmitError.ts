import { SubmissionError } from 'redux-form'
import type { ResponsesInReduxForm } from '~/components/Form/Form.type'

export default function proposalSubmitError(
  error: any,
  responses: ResponsesInReduxForm,
  onUnexpectedError?: () => void,
) {
  if (error instanceof SubmissionError) return error

  const details = error?.extensions
  if (details?.code === 'MEDIA_REUSE_DENIED') {
    if (!details.questionId) {
      return new SubmissionError({
        _error: 'unauthorized-access',
        [details.field]: { id: 'file-loading-failure', values: { fileName: details.mediaReference } },
      })
    }
    return new SubmissionError({
      _error: 'unauthorized-access',
      responses: responses.map(response =>
        response.question === details.questionId
          ? { value: { id: 'file-loading-failure', values: { fileName: details.mediaReference } } }
          : undefined,
      ),
    })
  }

  onUnexpectedError?.()
  return new SubmissionError({ _error: 'global.error.server.form' })
}
