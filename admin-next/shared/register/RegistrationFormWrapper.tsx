import * as React from 'react'
import { useIntl } from 'react-intl'
import type { RegistrationFormWrapper_query$key } from '@relay/RegistrationFormWrapper_query.graphql'
import { FormProvider, useForm } from 'react-hook-form'
import { graphql, useFragment } from 'react-relay'
import RegisterMutation from '@mutations/RegisterMutation'
import CookieMonster from '@shared/utils/CookieMonster'
import { ResponseInput } from '@relay/RegisterMutation.graphql'

type FormValues = {
  email: string
  plainPassword: string
  captcha?: string | null
  consentExternalCommunication?: boolean | null
  consentInternalCommunication?: boolean | null
  invitationToken?: string | null
  locale?: string | null
  responses: Array<ResponseInput | null>
  userType?: string | null
  username: string
  zipcode?: string | null
}

const FRAGMENT = graphql`
  fragment RegistrationFormWrapper_query on Query {
    registrationScript
    registrationForm {
      questions {
        id
      }
    }
  }
`

export const RegistrationFormWrapper: React.FC<{
  children: React.ReactNode
  query: RegistrationFormWrapper_query$key
  invitationToken?: string
  email?: string,
  onSuccess?: (email: string, password: string) => void
}> = ({ children, query: queryFragment, invitationToken, email, onSuccess }) => {
  const query = useFragment(FRAGMENT, queryFragment)

  const intl = useIntl()

  const methods = useForm<FormValues & { _error: any }>({
    mode: 'onSubmit',
    defaultValues: {
      responses: query.registrationForm?.questions?.map(q => ({ question: q.id })) ?? [],
      invitationToken,
      email,
    },
  })

  const { handleSubmit, setError, clearErrors } = methods

  const onSubmit = async (data: FormValues) => {
    const form = {
      ...data,
      charte: undefined,
    }

    const response = await RegisterMutation.commit({
      input: form,
    })
    const errorsCode = response.register?.errorsCode

    if (errorsCode) {
      errorsCode.forEach(errorCode => {
        if (errorCode === 'CAPTCHA_INVALID' && window && window.location.host !== 'capco.test')
          setError('_error', { message: 'registration.constraints.captcha.invalid' })
        if (errorCode === 'EMAIL_ALREADY_USED')
          setError('email', { message: intl.formatMessage({ id: 'registration.constraints.email.already_used' }) })
        if (errorCode === 'EMAIL_DOMAIN_NOT_AUTHORIZED')
          setError('email', { message: intl.formatMessage({ id: 'registration.constraints.email.not_authorized' }) })
        if (errorCode === 'RATE_LIMIT_REACHED')
          setError('email', { message: intl.formatMessage({ id: 'registration.constraints.rate.limit.reached' }) })
      })
      return
    }

    const adCookie = !(
      typeof CookieMonster.adCookieConsentValue() === 'undefined' || CookieMonster.adCookieConsentValue() === false
    )

    if (adCookie) {
      // @ts-expect-error call to window function not currently well typed
      window.App.dangerouslyExecuteHtml(query.registrationScript)
    }
    if (onSuccess) {
      onSuccess(data.email, data.plainPassword)
    }
  }

  return (
    <form
      noValidate
      onSubmit={e => {
        clearErrors()
        handleSubmit(onSubmit)(e)
      }}
      id="registration-form"
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}

export default RegistrationFormWrapper
