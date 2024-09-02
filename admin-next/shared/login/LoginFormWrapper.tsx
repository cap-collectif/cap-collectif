import * as React from 'react'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { FormProvider, useForm } from 'react-hook-form'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type FormValues = {
  email: string
  password: string
  displayCaptcha?: boolean
  captcha?: string | null
  onSuccessAction?: () => void
}

const LOGIN_WRONG_CREDENTIALS = 'Bad credentials.'
const MISSING_CAPTCHA = 'You must provide a captcha to login.'

// TODO onSuccessAction Debate
export const LoginFormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intl = useIntl()
  const restrictConnection = useFeatureFlag('restrict_connection')

  const methods = useForm<FormValues & { _error: any }>({
    mode: 'onSubmit',
  })

  const { handleSubmit, setError, setValue, clearErrors } = methods

  const onSubmit = (data: FormValues) => {
    if (!data.password || data.password.length < 1)
      return setError('_error', { message: 'your-email-address-or-password-is-incorrect' })

    if (data.displayCaptcha && restrictConnection && !data.captcha) {
      setValue('displayCaptcha', true)
      return setError('_error', { message: 'registration.constraints.captcha.invalid' })
    }

    return fetch(`${window.location.origin}/login_check`, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(response => {
        if (response.status >= 500) mutationErrorToast(intl)
        return response.json()
      })
      .then((response: { success?: boolean; reason: string | null | undefined; failedAttempts?: number }) => {
        if (response.success) {
          if (data?.onSuccessAction) {
            // userActions(props.values.onSuccessAction)
          } else {
            window.location.reload()
          }

          return true
        }

        if (response.reason === LOGIN_WRONG_CREDENTIALS) {
          if (response.failedAttempts !== undefined && response.failedAttempts >= 5) {
            setValue('displayCaptcha', true)
            return setError('_error', { message: 'your-email-address-or-password-is-incorrect' })
          }
          setError('_error', { message: 'your-email-address-or-password-is-incorrect' })
        } else if (response.reason === MISSING_CAPTCHA) {
          setValue('displayCaptcha', true)
          setError('_error', { message: 'registration.constraints.captcha.invalid' })
        } else if (response.reason) {
          setError('_error', { message: response.reason })
        } else mutationErrorToast(intl)
      })
  }

  return (
    <form
      onSubmit={e => {
        clearErrors()
        handleSubmit(onSubmit)(e)
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}

export default LoginFormWrapper
