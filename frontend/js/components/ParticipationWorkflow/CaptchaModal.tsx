import { Box, CapUIFontSize, Flex, Text, useMultiStepModal } from '@cap-collectif/ui'
import React from 'react'
import { useIntl } from 'react-intl'
import Captcha from '~/components/Form/Captcha'
import BinocularsSVG from '~/components/ParticipationWorkflow/assets/BinocularsSVG'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { CenteredLogoLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import { fakeTimer } from '~/utils/timer'

type Props = {
  onCaptchaSuccess?: () => void
  children?: React.ReactNode
}

const CaptchaModal: React.FC<Props> = ({ onCaptchaSuccess, children }) => {
  const intl = useIntl()
  const { currentStep, goToNextStep } = useMultiStepModal()
  const { captchaError, setCaptchaError, setCaptchaStepIndex } = useParticipationWorkflow()

  const title = intl.formatMessage({ id: 'participation-workflow.verification' })
  const info = intl.formatMessage({ id: 'participation-workflow.no_robot' })

  const captchaRef = React.useRef(null)

  React.useEffect(() => {
    setCaptchaStepIndex(currentStep)
    if (captchaRef.current) {
      captchaRef.current.focus()
    }
  }, [currentStep, setCaptchaStepIndex])

  return (
    <ModalLayout
      title={''}
      info={''}
      onClose={() => {}}
      hideGoBackArrow
      header={({ logo }) => <CenteredLogoLayout logo={logo} />}
    >
      <Flex direction="column" my={4}>
        <Box order={[1, 0]}>
          <Captcha
            captchaRef={captchaRef}
            style={{
              transformOrigin: 'center',
            }}
            onChange={async value => {
              if (!value) return
              setCaptchaError(null)

              if (onCaptchaSuccess) {
                onCaptchaSuccess()
                return
              }
              await fakeTimer()
              goToNextStep()
            }}
          />
          {captchaError ? (
            <Text mt={2} color="red.700" fontSize={CapUIFontSize.BodySmall} role="alert">
              {intl.formatMessage({ id: captchaError })}
            </Text>
          ) : null}
        </Box>
        {children ? children : null}
        <Flex justifyContent="center">
          <BinocularsSVG />
        </Flex>
        <Box
          mb={4}
          width="100%"
          fontSize={[CapUIFontSize.Headline, CapUIFontSize.DisplaySmall]}
          textAlign="center"
          fontWeight={[600, 400]}
          color="neutral-gray.900"
        >
          {title}
        </Box>
        <Text
          sx={{ marginBottom: '16px !important' }}
          textAlign="center"
          color="neutral-gray.700"
          fontSize={CapUIFontSize.BodyRegular}
          lineHeight="normal"
        >
          {info}
        </Text>
      </Flex>
    </ModalLayout>
  )
}

export default CaptchaModal
