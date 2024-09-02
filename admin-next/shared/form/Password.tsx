import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, CapInputSize, FormLabel } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { CheckInfo } from '@shared/ui/CheckInfo'

export const getPasswordError = (hasRequiredLength: boolean, hasUpperLowerCase: boolean, hasDigit: boolean) => {
  const sum = (hasRequiredLength ? 0 : 1) + (hasUpperLowerCase ? 0 : 2) + (hasDigit ? 0 : 4)

  switch (sum) {
    case 0:
      return null
    case 1:
      return 'registration.constraints.password.min'
    case 2:
      return 'at-least-one-uppercase-one-lowercase'
    case 3:
      return 'at-least-8-characters-one-uppercase-one-lowercase'
    case 4:
      return 'at-least-one-digit'
    case 5:
      return 'at-least-8-characters-one-digit'
    case 6:
      return 'at-least-one-digit-one-uppercase-one-lowercase'
    case 7:
      return 'at-least-8-characters-one-digit-one-uppercase-one-lowercase'
    default:
      return null
  }
}

export const Password = React.forwardRef<any, { name: string; id: string }>(({ name, id }, ref) => {
  const [isFocus, setIsFocus] = React.useState(false)
  const intl = useIntl()
  const securePassword = useFeatureFlag('secure_password')
  const { control, watch } = useFormContext()

  const password: string = watch(name)
  const hasRequiredLength = password?.length >= 8
  const hasUpperLowerCase = /[A-Z]/.test(password) && /[a-z]/.test(password)
  const hasDigit = /\d/.test(password)

  return (
    <Box mb={2}>
      <FormControl name={name} control={control} isRequired>
        <FormLabel htmlFor={name} label={intl.formatMessage({ id: 'registration.password' })} mb={0} />
        <FieldInput
          type="password"
          control={control}
          name={name}
          id={id}
          autoFocus
          aria-required
          rules={{
            validate: p => {
              const errorMessage = getPasswordError(p.length >= 8, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p))
              return errorMessage && securePassword ? intl.formatMessage({ id: errorMessage }) : true
            },
          }}
          autoComplete="off"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          variantSize={CapInputSize.Md}
          ref={ref}
        />
      </FormControl>
      {securePassword && isFocus ? (
        <Box mb={2} mt={-1}>
          {intl.formatMessage({ id: 'your-password-must-have' })}
          <CheckInfo label={intl.formatMessage({ id: 'at-least-8-characters' })} checked={hasRequiredLength} />
          <CheckInfo label={intl.formatMessage({ id: 'lower-and-upper-case-letters' })} checked={hasUpperLowerCase} />
          <CheckInfo label={intl.formatMessage({ id: 'at-least-1-digit' })} checked={hasDigit} />
        </Box>
      ) : null}
    </Box>
  )
})
Password.displayName = 'Password'

export default Password
