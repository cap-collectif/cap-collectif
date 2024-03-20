import type { FC } from 'react'
import { Section } from '@ui/Section'
import { useIntl } from 'react-intl'
import {
  Box,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Icon,
  SpotIcon,
  Text,
} from '@cap-collectif/ui'
import ModalCreditRefill from './ModalCreditRefill/ModalCreditRefill'

const SectionSmsPresentation: FC = () => {
  const intl = useIntl()

  return (
    <Section direction="row" justify="space-between" align="center">
      <Box>
        <Section.Title>{intl.formatMessage({ id: 'verification-with-sms' })}</Section.Title>
        <Section.Description mb={4}>
          {intl.formatMessage({ id: 'description-sms-service-not-activated' })}
        </Section.Description>

        <Box mb={5}>
          <Flex spacing={1} align="center">
            <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="blue.500" />
            <Text color="gray.900" lineHeight={CapUILineHeight.S} fontSize={3}>
              {intl.formatMessage({ id: 'check-phone-number' })}
            </Text>
          </Flex>

          <Flex spacing={1} align="center">
            <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="blue.500" />
            <Text color="gray.900" lineHeight={CapUILineHeight.S} fontSize={3}>
              {intl.formatMessage({ id: 'send-verification-code-sms' })}
            </Text>
          </Flex>
        </Box>

        <ModalCreditRefill firstRequest />
      </Box>

      <SpotIcon name={CapUISpotIcon.SMS} size={CapUISpotIconSize.Lg} />
    </Section>
  )
}

export default SectionSmsPresentation
