import * as React from 'react'
import { useIntl } from 'react-intl'
import { FormControl, FieldInput } from '@cap-collectif/form'
import { Box, CapInputSize, FormLabel, Link } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import Captcha from '../form/Captcha'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export const LoginForm: React.FC = () => {
  const intl = useIntl()
  const restrictConnection = useFeatureFlag('restrict_connection')
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()
  const displayCaptcha = watch('displayCaptcha')

  return (
    <>
      {errors._error ? (
        <Box
          id="login-error"
          p={4}
          borderRadius="normal"
          border="normal"
          backgroundColor="red.100"
          borderColor="red.400"
          color="red.600"
          mb={5}
          fontWeight={600}
        >
          {intl.formatMessage({ id: errors._error?.message as string })}
          {errors._error?.message === 'your-email-address-or-password-is-incorrect' ? (
            <Box fontWeight={400} mt={1}>
              {intl.formatMessage({ id: 'try-again-or-click-on-forgotten-password-to-reset-it' })}
            </Box>
          ) : null}
        </Box>
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
      <Link href="/resetting/request" color="primary.500">
        {intl.formatMessage({ id: 'global.forgot_password' })}
      </Link>
      {displayCaptcha && restrictConnection ? <Captcha name="captcha" /> : null}
    </>
  )
}

export default LoginForm
