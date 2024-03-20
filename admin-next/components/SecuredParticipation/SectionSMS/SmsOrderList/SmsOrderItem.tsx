import type { FC } from 'react'
import { CapUIFontWeight, CapUILineHeight, Card, Flex, Text } from '@cap-collectif/ui'
import { formatBigNumber } from '@utils/format-number'
import ModalProcessRequest from '../ModalProcessRequest/ModalProcessRequest'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { SmsOrderItem_smsOrder$key } from '@relay/SmsOrderItem_smsOrder.graphql'

const FRAGMENT = graphql`
  fragment SmsOrderItem_smsOrder on SmsOrder {
    id
    isProcessed
    amount
    createdAt
    ...ModalProcessRequest_smsOrder
  }
`

type SmsOrderItemProps = {
  smsOrder: SmsOrderItem_smsOrder$key
  connectionName: string
}

const SmsOrderItem: FC<SmsOrderItemProps> = ({ smsOrder: smsOrderFragment, connectionName }) => {
  const intl = useIntl()
  const smsOrder = useFragment(FRAGMENT, smsOrderFragment)

  return (
    <Card display="flex" justifyContent="space-between" key={smsOrder.id}>
      <Flex direction="column" mr={2}>
        <Text fontWeight={CapUIFontWeight.Semibold} color="gray.900" fontSize={1} lineHeight={CapUILineHeight.Sm}>
          {intl.formatMessage({ id: 'global.order' })}
        </Text>
        <Text color="gray.900" fontSize={1} lineHeight={CapUILineHeight.Sm}>
          {intl.formatMessage(
            { id: 'client-request-pack-credit' },
            {
              creditCount: formatBigNumber(smsOrder.amount),
              date: intl.formatDate(smsOrder.createdAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              }),
            },
          )}
        </Text>
      </Flex>

      <ModalProcessRequest smsOrder={smsOrder} connectionName={connectionName} />
    </Card>
  )
}

export default SmsOrderItem
