import * as React from 'react'
import { useIntl } from 'react-intl'
import { FormControl, FieldInput } from '@cap-collectif/form'
import { CapInputSize, FormLabel, InfoMessage, Link } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import Captcha from '../form/Captcha'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import {PENDING_EMAIL_CONFIRMATION} from './LoginFormWrapper'

export const LoginForm: React.FC = () => {
  const intl = useIntl()
  const restrictConnection = useFeatureFlag('restrict_connection')
  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext()
  const displayCaptcha = watch('displayCaptcha')

  const infoMessageVariant = errors._error?.message === PENDING_EMAIL_CONFIRMATION ? 'warning' : 'danger'

  const email = getValues('username')

  return (
    <>
      {errors._error ? (
        <InfoMessage
          variant={infoMessageVariant}
          id="login-error"
          mb={4}
        >
          <InfoMessage.Title>
            {intl.formatMessage({ id: errors._error?.message as string })}
          </InfoMessage.Title>
          <InfoMessage.Content>
            {errors._error?.message === PENDING_EMAIL_CONFIRMATION ? (
              <p>{intl.formatMessage({ id: 'email-confirmation-help-message'}, { email })}</p>
            ) : null}
            {errors._error?.message === 'your-email-address-or-password-is-incorrect' ? (
              <p>{intl.formatMessage({ id: 'try-again-or-click-on-forgotten-password-to-reset-it' })}</p>
            ) : null}
          </InfoMessage.Content>
        </InfoMessage>
      ) : null}
      <FormControl name="username" control={control} isRequired mb={2}>
        <FormLabel htmlFor="username" label={intl.formatMessage({ id: 'global.email' })} mb={0} />
        <FieldInput
          type="email"
          control={control}
          name="username"
          autoFocus
          aria-required
          autoComplete="email"
          variantSize={CapInputSize.Md}
          placeholder={intl.formatMessage({
            id: 'email.placeholder',
          })}
        />
      </FormControl>
      <FormControl name="password" control={control} isRequired mb={2}>
        <FormLabel htmlFor="password" label={intl.formatMessage({ id: 'global.password' })} mb={0} />
        <FieldInput
          type="password"
          control={control}
          name="password"
          aria-required
          autoComplete="off"
          variantSize={CapInputSize.Md}
        />
      </FormControl>
      <Link href="/resetting/request">{intl.formatMessage({ id: 'global.forgot_password' })}</Link>
      {displayCaptcha && restrictConnection ? <Captcha name="captcha" /> : null}
    </>
  )
}

export default LoginForm
