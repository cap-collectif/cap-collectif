import { ButtonGroup, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Table, Tag, Text } from '@cap-collectif/ui'
import type { NewsletterSubscriptionItem_newsletterSubscription$key } from '@relay/NewsletterSubscriptionItem_newsletterSubscription.graphql'
import type { NewsletterSubscriptionList_query$key } from '@relay/NewsletterSubscriptionList_query.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, RefetchFnDynamic, useFragment } from 'react-relay'
import { OperationType } from 'relay-runtime'
import DeleteNewsletterSubscriptionModal from './DeleteNewsletterSubscriptionModal'
import NewsletterSubscriptionModal from './NewsletterSubscriptionModal'

const FRAGMENT = graphql`
  fragment NewsletterSubscriptionItem_newsletterSubscription on NewsletterSubscription {
    id
    email
    isEnabled
    createdAt
  }
`

type Props = {
  newsletterSubscription: NewsletterSubscriptionItem_newsletterSubscription$key
  connectionId: string
  refetch: RefetchFnDynamic<OperationType, NewsletterSubscriptionList_query$key>
  search: string | null
}

const NewsletterSubscriptionItem: React.FC<Props> = ({
  newsletterSubscription: fragmentKey,
  connectionId,
  refetch,
  search,
}) => {
  const intl = useIntl()
  const newsletterSubscription = useFragment(FRAGMENT, fragmentKey)

  return (
    <>
      <Table.Td>
        <Text truncate={128}>{newsletterSubscription.email}</Text>
      </Table.Td>
      <Table.Td>
        <Tag variantColor={newsletterSubscription.isEnabled ? 'success' : 'infoGray'}>
          {intl.formatMessage({ id: newsletterSubscription.isEnabled ? 'global.yes' : 'global.no' })}
        </Tag>
      </Table.Td>
      <Table.Td>
        {intl.formatDate(newsletterSubscription.createdAt, { day: 'numeric', month: 'numeric', year: 'numeric' })}
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center">
          <ButtonGroup>
            <NewsletterSubscriptionModal
              newsletterSubscription={newsletterSubscription}
              refetch={refetch}
              search={search}
              disclosure={
                <ButtonQuickAction
                  icon={CapUIIcon.Pencil}
                  size={CapUIIconSize.Md}
                  variantColor="primary"
                  label={intl.formatMessage({ id: 'global.edit.title' }, { name: newsletterSubscription.email })}
                />
              }
            />
            <DeleteNewsletterSubscriptionModal
              newsletterSubscription={newsletterSubscription}
              connectionId={connectionId}
              refetch={refetch}
              search={search}
            />
          </ButtonGroup>
        </Flex>
      </Table.Td>
    </>
  )
}

export default NewsletterSubscriptionItem
