import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, CapInputSize, Flex, FormLabel, Text, useMultiStepModal } from '@cap-collectif/ui'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { ACCOUNT_LOGIN_FORM_INDEX } from './EmailAccountLoginForm'
import { PARTICIPANT_CAPTCHA_INDEX } from './EmailParticipantCaptcha'
import ModalLayout from './ModalLayout'
import { HideBackArrowLayout } from './ModalLayoutHeader'
import { fakeTimer } from './utils/timer'

type Props = {
  hideGoBackArrow: boolean
}

type FormValues = {
  email: string
}

export const PARTICIPANT_FORM_INDEX = 0

const EmailParticipantForm: React.FC<Props> = ({ hideGoBackArrow }) => {
  const intl = useIntl()
  const { setCurrentStep } = useMultiStepModal()
  const [isLoading, setLoading] = React.useState(false)

  const { handleSubmit, control, setFocus, clearErrors } = useFormContext<FormValues>()

  const goToAccountForm = () => setCurrentStep(ACCOUNT_LOGIN_FORM_INDEX)
  const goToParticipantCaptcha = () => setCurrentStep(PARTICIPANT_CAPTCHA_INDEX)

  React.useEffect(() => {
    clearErrors('email')
    const timeout = setTimeout(() => {
      setFocus('email')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus, clearErrors])

  const onSubmit = async () => {
    setLoading(true)
    await fakeTimer()
    goToParticipantCaptcha()
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        header={
          hideGoBackArrow
            ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
                <HideBackArrowLayout
                  intl={intl}
                  onClose={onClose}
                  goBackCallback={goBackCallback}
                  logo={logo}
                  isMobile={isMobile}
                />
              )
            : null
        }
        title={intl.formatMessage({ id: 'participation-workflow.email_address' })}
        info={intl.formatMessage({ id: 'participation-workflow.email_address_helptext' })}
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
              variantColor="hierarchy"
            />
          </FormControl>
          <Flex direction="column">
            <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
              {intl.formatMessage({ id: 'global.continue' })}
            </Button>
            <Flex alignItems="center" my={3}>
              <Text border="1px solid #EBEBEB" width="100%" m={0} />
              <Text px={2} m={0}>
                {intl.formatMessage({ id: 'global.or' })}
              </Text>
              <Text border="1px solid #EBEBEB" width="100%" m={0} />
            </Flex>
            <Button
              variantSize="big"
              justifyContent="center"
              width="100%"
              type="button"
              variant="secondary"
              onClick={goToAccountForm}
            >
              {intl.formatMessage({ id: 'log-on-to' })}
            </Button>
          </Flex>
        </Box>
      </ModalLayout>
    </>
  )
}

export default EmailParticipantForm
