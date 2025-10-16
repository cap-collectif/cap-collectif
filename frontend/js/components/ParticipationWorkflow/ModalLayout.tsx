import * as React from 'react'
import { Flex, Box, MultiStepModal, Text, useMultiStepModal, CapUIFontSize } from '@cap-collectif/ui'
import { IntlShape, useIntl } from 'react-intl'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { DefaultLayout as HeaderLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'
import Confetti from '~/components/ParticipationWorkflow/Confetti'

type HeaderProps = {
  goBackCallback: () => void
  logo: {
    width: number
    height: number
    url: string
  }
  intl: IntlShape
  onClose: () => void
  isMobile: boolean
}

const ModalLayout = ({
  onClose,
  hideGoBackArrow = false,
  children,
  title,
  info,
  onBack,
  textBlockOrder = [0, 0],
  header,
  showConfetti = false,
}: {
  onClose: () => void
  hideGoBackArrow?: boolean
  children: React.ReactNode
  title: string
  info?: string | React.ReactNode
  onBack?: () => void
  textBlockOrder?: [number, number]
  header?: (headerProps: HeaderProps) => React.ReactNode
  showConfetti?: boolean
}) => {
  const { goToPreviousStep } = useMultiStepModal()
  const intl = useIntl()
  const { logo } = useParticipationWorkflow()
  const isMobile = useIsMobile()

  const getGoBackCallback = () => {
    if (onBack) {
      return onBack
    }
    if (hideGoBackArrow) {
      return () => {}
    }
    return goToPreviousStep
  }

  const goBackCallback = getGoBackCallback()

  return (
    <>
      <MultiStepModal.Header>
        {header ? (
          header({ goBackCallback, logo, intl, onClose, isMobile })
        ) : (
          <HeaderLayout intl={intl} logo={logo} onClose={onClose} goBackCallback={goBackCallback} isMobile={isMobile} />
        )}
      </MultiStepModal.Header>
      {showConfetti && <Confetti />}
      <MultiStepModal.Body bg="neutral-gray.50">
        <Flex
          sx={{
            '.cap-form-label p': { marginBottom: 0, fontWeight: 400 },
            'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            'input[type=number]': { MozAppearance: 'textfield' },
            '.cap-address__dropdown': { padding: 0, width: '100%' },
            input: {
              fontSize: '16px',
            },
          }}
          py={[4, 13]}
          direction="column"
          justifyContent="center"
          alignItems="center"
          margin="auto"
          maxWidth="540px"
        >
          <Box order={textBlockOrder} width={isMobile ? '100%' : 'auto'}>
            <Box
              mb={isMobile ? '4px' : 4}
              width="100%"
              fontSize={[CapUIFontSize.Headline, CapUIFontSize.DisplaySmall]}
              textAlign={['left', 'center']}
              fontWeight={[600, 400]}
              color="neutral-gray.900"
            >
              {title}
            </Box>
            {info && (
              <Text
                sx={{ marginBottom: '16px !important' }}
                textAlign={['left', 'center']}
                color="neutral-gray.700"
                fontSize={CapUIFontSize.BodyRegular}
                lineHeight="normal"
              >
                {info}
              </Text>
            )}
          </Box>
          {children}
        </Flex>
      </MultiStepModal.Body>
    </>
  )
}

export default ModalLayout
