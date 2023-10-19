import React from 'react'
import { FormattedMessage } from 'react-intl'
import { RETRY_LIMIT } from '~/components/Questionnaire/QuestionnaireAdminResultsPdfModal'
type Props = {
  readonly loading: boolean
  readonly error: boolean
  readonly retryCount: number
}

const QuestionnaireAdminResultsPdfModalBody = ({ loading, error, retryCount }: Props) => {
  if (error && retryCount < RETRY_LIMIT) {
    return <FormattedMessage id="sorry.export.failed" />
  }

  if (error && retryCount >= RETRY_LIMIT) {
    return <FormattedMessage id="sorry.export.failed.try.later" />
  }

  if (loading) {
    return <FormattedMessage id="this.may.take.a.few.moments" />
  }

  return <FormattedMessage id="data.exported.to.pdf" />
}

export default QuestionnaireAdminResultsPdfModalBody
