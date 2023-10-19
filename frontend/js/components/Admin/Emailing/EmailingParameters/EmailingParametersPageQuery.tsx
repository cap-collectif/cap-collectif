import * as React from 'react'
import { useQueryLoader } from 'react-relay'
import EmailingParametersPage, { EmailingParametersPageQuery } from './EmailingParametersPage'

const EmailingParameterPageQueryRender = (): JSX.Element => {
  const [queryReference, loadQuery] = useQueryLoader(EmailingParametersPageQuery)
  React.useEffect(() => {
    if (!queryReference) {
      loadQuery({
        type: 'MAILER',
      })
    }
  }, [loadQuery, queryReference])
  return queryReference ? <EmailingParametersPage queryReference={queryReference} /> : null
}

export default EmailingParameterPageQueryRender
