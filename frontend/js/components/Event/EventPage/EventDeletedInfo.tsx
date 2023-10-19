import React from 'react'
import { useIntl } from 'react-intl'
import { Text, InfoMessage, Flex } from '@cap-collectif/ui'

export const EventDeletedInfo = () => {
  const intl = useIntl()
  return (
    <Flex justifyContent="center" p={[10]}>
      <InfoMessage variant="danger" mb="56px">
        <Text as="span" fontSize={[3, 4]} fontWeight={600} color="red.800">
          {intl.formatMessage({
            id: 'event-cancelled',
          })}
        </Text>
      </InfoMessage>
    </Flex>
  )
}
export default EventDeletedInfo
