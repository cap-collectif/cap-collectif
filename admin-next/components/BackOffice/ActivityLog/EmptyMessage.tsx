import * as React from 'react'
import { Button, CapUIFontSize, CapUIFontWeight, CapUILineHeight, Flex, Text } from '@cap-collectif/ui'

import { useIntl } from 'react-intl'

type Props = {
  onReset: () => void
}

export const EmptyMessage: React.FC<Props> = ({ onReset }) => {
  const intl = useIntl()

  return (
    <Flex direction="column" m={8}>
      <Text fontSize={CapUIFontSize.Headline} fontWeight={CapUIFontWeight.Semibold} lineHeight={CapUILineHeight.M}>
        {intl.formatMessage({
          id: 'global.no-results',
        })}
      </Text>

      <Text fontSize={CapUIFontSize.BodyLarge} lineHeight={CapUILineHeight.L}>
        {intl.formatMessage({
          id: 'adjust-search-filters-to-find',
        })}
      </Text>
      <Button onClick={onReset} variant="secondary" width={'fit-content'} mt={4}>
        {intl.formatMessage({
          id: 'table.empty.reset-filters-and-search',
        })}
      </Button>
    </Flex>
  )
}

export default EmptyMessage
