import type { FC } from 'react'
import { Flex } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import type { SmsOrderList_query$key } from '@relay/SmsOrderList_query.graphql'
import SmsOrderItem from './SmsOrderItem'

const FRAGMENT = graphql`
  fragment SmsOrderList_query on Query {
    smsOrders {
      __id
      edges {
        node {
          id
          ...SmsOrderItem_smsOrder
        }
      }
    }
  }
`

type SmsOrderListProps = {
  query: SmsOrderList_query$key
}

const SmsOrderList: FC<SmsOrderListProps> = ({ query: queryFragment }) => {
  const { smsOrders } = useFragment(FRAGMENT, queryFragment)

  return (
    <Flex direction="column" spacing={3}>
      {smsOrders?.edges
        ?.filter(Boolean)
        .map(edge => edge?.node)
        .filter(Boolean)
        .map(
          smsOrder =>
            smsOrder && <SmsOrderItem key={smsOrder.id} smsOrder={smsOrder} connectionName={smsOrders.__id} />,
        )}
    </Flex>
  )
}

export default SmsOrderList
