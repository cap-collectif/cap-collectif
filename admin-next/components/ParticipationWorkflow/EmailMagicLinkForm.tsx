import React from 'react'
import ModalLayout from './ModalLayout'
import { Box, Button, CapInputSize, FormLabel, useMultiStepModal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { ACCOUNT_LOGIN_FORM_INDEX } from './EmailAccountLoginForm'
import { MAGIC_LINK_CAPTCHA_INDEX } from './EmailMagicLinkCaptcha'
import { fakeTimer } from './utils/timer'

type FormValues = {
  email: string
}

export const MAGIC_LINK_FORM_INDEX = 6

const EmailMagicLinkForm: React.FC = () => {
  const intl = useIntl()

  const { setCurrentStep } = useMultiStepModal()
  const goToMagicLinkCaptcha = () => setCurrentStep(MAGIC_LINK_CAPTCHA_INDEX)
  const goToAccountLoginForm = () => setCurrentStep(ACCOUNT_LOGIN_FORM_INDEX)

  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSubmit, control, setFocus, clearErrors } = useFormContext<FormValues>()

  React.useEffect(() => {
    clearErrors('email')
    const timeout = setTimeout(() => {
      setFocus('email')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus, clearErrors])

  const onSubmit = async () => {
    setIsLoading(true)
    await fakeTimer()
    goToMagicLinkCaptcha()
  }

  return (
    <>
      <ModalLayout
        title={intl.formatMessage({ id: 'connection-link' })}
        info={intl.formatMessage({ id: 'to-connect-without-password' })}
        onClose={() => {}}
        onBack={goToAccountLoginForm}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="email" control={control} isRequired>
            <FormLabel htmlFor="email" label={intl.formatMessage({ id: 'user_email' })} />
            <FieldInput
              id="email"
              name="email"
              control={control}
              type="email"
              variantSize={CapInputSize.Md}
              placeholder={intl.formatMessage({ id: 'email.placeholder' })}
            />
          </FormControl>
          <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  )
}

export default EmailMagicLinkForm
