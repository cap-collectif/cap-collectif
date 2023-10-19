import * as React from 'react'
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl'
import AlertFormSucceededMessage from './AlertFormSucceededMessage'

type Props = {
  valid?: boolean
  invalid?: boolean
  submitting?: boolean
  submitSucceeded?: boolean
  submitFailed?: boolean
  errorMessage?: string | null | undefined
}
export const AlertForm = ({ valid, invalid, submitSucceeded, submitFailed, submitting, errorMessage }: Props) => {
  const hasGlobalServerError = (valid && submitSucceeded && !submitting) || (submitting && submitFailed)

  if (errorMessage) {
    return (
      <div className="d-ib">
        <div className="alert__form_server-failed-message">
          <i className="cap cap-ios-close-outline" /> <FormattedHTMLMessage id={errorMessage} />
        </div>
      </div>
    )
  }

  if (invalid) {
    return (
      <div className="d-ib">
        <div className="alert__form_invalid-field">
          <i className="cap cap-ios-close-outline" /> <FormattedMessage id="global.invalid.form" />
        </div>
      </div>
    )
  }

  if (hasGlobalServerError) {
    return (
      <div className="d-ib">
        {valid && submitSucceeded && !submitting && <AlertFormSucceededMessage />}
        {submitting && submitFailed && (
          <div className="alert__form_server-failed-message">
            <i className="cap cap-ios-close-outline" /> <FormattedHTMLMessage id="global.error.server.form" />
          </div>
        )}
      </div>
    )
  }

  return null
}
export default AlertForm
