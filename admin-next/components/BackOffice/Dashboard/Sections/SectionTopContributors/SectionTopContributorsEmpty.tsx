import { useIntl } from 'react-intl'
import Section from '@ui/Section/Section'
import { CapUIFontSize, CapUILineHeight, Flex, Text } from '@cap-collectif/ui'

const SectionTopContributorsEmpty = () => {
  const intl = useIntl()

  return (
    <Section spacing={6} border="normal" borderColor="gray.150">
      <Text fontSize={CapUIFontSize.BodyRegular} color="blue.800">
        {intl.formatMessage({ id: 'most-active-contributors' })}
      </Text>

      <Flex direction="column" align="center" py={6} spacing={1}>
        <Text color="gray.900" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S} textAlign="center">
          {intl.formatMessage({ id: 'no-data-found-date-range' })}
        </Text>
        <Text color="gray.800" fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S}>
          {intl.formatMessage({ id: 'please-select-another-period' })}
        </Text>
      </Flex>
    </Section>
  )
}

export default SectionTopContributorsEmpty
