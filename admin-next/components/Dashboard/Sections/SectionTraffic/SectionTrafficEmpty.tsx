import { useIntl } from 'react-intl'
import Section from '../../../UI/Section/Section'
import { CapUILineHeight, Flex, Text } from '@cap-collectif/ui'

const SectionTrafficEmpty = () => {
  const intl = useIntl()

  return (
    <Section width="50%" spacing={6} border="normal" borderColor="gray.150">
      <Text fontSize={3} color="blue.800">
        {intl.formatMessage({ id: 'traffic-source' })}
      </Text>

      <Flex direction="column" align="center" py={10} spacing={1}>
        <Text color="gray.900" fontSize={2} lineHeight={CapUILineHeight.Sm} textAling="center">
          {intl.formatMessage({ id: 'no-data-found-date-range' })}
        </Text>
        <Text color="gray.800" fontSize={1} lineHeight={CapUILineHeight.Sm}>
          {intl.formatMessage({ id: 'please-select-another-period' })}
        </Text>
      </Flex>
    </Section>
  )
}

export default SectionTrafficEmpty
