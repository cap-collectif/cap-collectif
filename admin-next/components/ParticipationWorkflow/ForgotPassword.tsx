import React from 'react'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useIntl } from 'react-intl'

type RenderProps = (props: {
  sendForgotPasswordEmail: () => void
  isLoading: boolean
  hasError: boolean
}) => React.ReactNode

type Props = {
  email: string
  onSuccess?: () => void
  children: RenderProps | React.ReactNode
}

type FormState = 'LOADING' | 'ERROR'

const ForgotPassword: React.FC<Props> = ({ email, onSuccess, children }) => {
  const intl = useIntl()
  const [formState, setFormState] = React.useState<FormState>(null)
  const resetFormState = () => setFormState(null)
  const isLoading = formState === 'LOADING'
  const hasError = formState === 'ERROR'

  const sendForgotPasswordEmail = async () => {
    setFormState('LOADING')

    const body = new URLSearchParams()
    body.append('email', email)

    const response = await fetch(`${window.location.origin}/resetting/send-email`, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
      method: 'POST',
    })

    if (!response.ok) {
      setFormState('ERROR')
      return mutationErrorToast(intl)
    }

    resetFormState()

    if (onSuccess) {
      onSuccess()
    }
  }

  if (typeof children === 'function') {
    return children({ sendForgotPasswordEmail, isLoading, hasError })
  }

  return children
}

export default ForgotPassword
