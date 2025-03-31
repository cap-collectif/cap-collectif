import { useIntl } from 'react-intl'
import Section from '../../../UI/Section/Section'
import { CapUIFontSize, CapUILineHeight, Flex, Text } from '@cap-collectif/ui'

const SectionMostVisitedPagesEmpty = () => {
  const intl = useIntl()

  return (
    <Section spacing={6} border="normal" borderColor="gray.150">
      <Text fontSize={CapUIFontSize.BodyRegular} color="blue.800">
        {intl.formatMessage({ id: 'most-visited-pages' })}
      </Text>

      <Flex direction="column" align="center" py={10} spacing={1}>
        <Text color="gray.900" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S} textAling="center">
          {intl.formatMessage({ id: 'no-data-found-date-range' })}
        </Text>
        <Text color="gray.800" fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S}>
          {intl.formatMessage({ id: 'please-select-another-period' })}
        </Text>
      </Flex>
    </Section>
  )
}

export default SectionMostVisitedPagesEmpty
