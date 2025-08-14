import React from 'react'
import Captcha from '~/components/Form/Captcha'
import { useIntl } from 'react-intl'
import { Box, Flex, Text, useMultiStepModal, CapUIFontSize } from '@cap-collectif/ui'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { fakeTimer } from '~/utils/timer'
import BinocularsSVG from '~/components/ParticipationWorkflow/assets/BinocularsSVG'
import { CenteredLogoLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'


type Props = {
  onCaptchaSuccess?: () => void
  children?: React.ReactNode
};

const CaptchaModal: React.FC<Props> = ({ onCaptchaSuccess, children }) => {
  const intl = useIntl()
  const { goToNextStep } = useMultiStepModal()

  const title = intl.formatMessage({ id: 'participation-workflow.verification' })
  const info = intl.formatMessage({ id: 'participation-workflow.no_robot' })

  const captchaRef = React.useRef(null);

  React.useEffect(() => {
    if (captchaRef.current) {
      captchaRef.current.focus();
    }
  }, []);

  return (
    <ModalLayout
      title={''}
      info={''}
      onClose={() => {
      }}
      hideGoBackArrow
      header={({ logo }) => (
        <CenteredLogoLayout logo={logo} />
      )}
    >
      <Flex direction="column" my={4}>
        <Box order={[1, 0]}>
          <Captcha
            captchaRef={captchaRef}
            style={{
              transformOrigin: 'center',
            }}
            onChange={async (value) => {
              if(!value) return;

              if (onCaptchaSuccess) {
                onCaptchaSuccess()
                return
              }
              await fakeTimer()
              goToNextStep()
            }}
          />
        </Box>
        {children ? children : null}
        <Flex justifyContent="center">
          <BinocularsSVG />
        </Flex>
        <Box mb={4} width="100%" fontSize={[CapUIFontSize.Headline, CapUIFontSize.DisplaySmall]} textAlign="center" fontWeight={[600, 400]}
             color="neutral-gray.900">
          {title}
        </Box>
        <Text sx={{ marginBottom: '16px !important' }} textAlign="center" color="neutral-gray.700"
              fontSize={CapUIFontSize.BodyRegular} lineHeight="normal">
          {info}
        </Text>
      </Flex>
    </ModalLayout>
  )
}

export default CaptchaModal
