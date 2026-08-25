import { Box, Button, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Table, Tag, Text } from '@cap-collectif/ui'
import type { SocialNetworkListPaginationQuery } from '@relay/SocialNetworkListPaginationQuery.graphql'
import type { SocialNetworkListQuery } from '@relay/SocialNetworkListQuery.graphql'
import type { SocialNetworkList_query$key } from '@relay/SocialNetworkList_query.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import SocialNetworkDeleteModal from './SocialNetworkDeleteModal'
import SocialNetworkModal from './SocialNetworkModal'
import { SocialNetworkRow } from './types'

const SOCIAL_NETWORKS_PAGINATION_COUNT = 100

const QUERY = graphql`
  query SocialNetworkListQuery($count: Int = 100, $cursor: String) {
    ...SocialNetworkList_query @arguments(count: $count, cursor: $cursor)
  }
`

const FRAGMENT = graphql`
  fragment SocialNetworkList_query on Query
  @argumentDefinitions(count: { type: "Int", defaultValue: 100 }, cursor: { type: "String" })
  @refetchable(queryName: "SocialNetworkListPaginationQuery") {
    socialNetworks(first: $count, after: $cursor) @connection(key: "SocialNetworkList_socialNetworks") {
      __id
      edges {
        node {
          id
          title
          link
          position
          isEnabled
          updatedAt
          media {
            id
            name
            size
            type: contentType
            url(format: "default_socialIcon")
          }
        }
      }
    }
  }
`

const SocialNetworkList: React.FC = () => {
  const intl = useIntl()
  const queryRef = useLazyLoadQuery<SocialNetworkListQuery>(QUERY, { count: SOCIAL_NETWORKS_PAGINATION_COUNT })
  const { data: query } = usePaginationFragment<SocialNetworkListPaginationQuery, SocialNetworkList_query$key>(
    FRAGMENT,
    queryRef,
  )
  const [socialNetworkToDelete, setSocialNetworkToDelete] = React.useState<SocialNetworkRow | null>(null)

  const socialNetworks = React.useMemo<SocialNetworkRow[]>(
    () =>
      query.socialNetworks?.edges?.map(edge => edge?.node).filter((node): node is NonNullable<typeof node> => !!node) ??
      [],
    [query.socialNetworks?.edges],
  )

  const connectionId = query.socialNetworks?.__id

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Flex align="center" justify="flex-start" mb={4}>
        <SocialNetworkModal
          connectionId={connectionId}
          disclosure={
            <Button leftIcon={CapUIIcon.Add} variantSize="small">
              {intl.formatMessage({ id: 'admin.social-network.create-button' })}
            </Button>
          }
        />
      </Flex>

      <SocialNetworkDeleteModal
        show={!!socialNetworkToDelete}
        onClose={() => setSocialNetworkToDelete(null)}
        connectionId={connectionId}
        socialNetwork={socialNetworkToDelete}
      />

      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'global.title' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.published' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.link' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.image' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.position' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {socialNetworks.map((row, index) => (
            <Table.Tr key={row.id} rowId={row.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>
                <Text truncate={64}>{row.title}</Text>
              </Table.Td>
              <Table.Td>
                <Tag variantColor={row.isEnabled ? 'success' : 'infoGray'}>
                  {intl.formatMessage({ id: row.isEnabled ? 'global.published' : 'global.no.published' })}
                </Tag>
              </Table.Td>
              <Table.Td>
                <Text truncate={64}>{row.link}</Text>
              </Table.Td>
              <Table.Td>
                {row.media?.url ? (
                  <Box as="img" src={row.media.url} alt="" width="32px" height="32px" sx={{ objectFit: 'contain' }} />
                ) : null}
              </Table.Td>
              <Table.Td>{row.position}</Table.Td>
              <Table.Td>
                {intl.formatDate(row.updatedAt ?? undefined, {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </Table.Td>
              <Table.Td>
                <Flex justify="flex-end" spacing={2}>
                  <SocialNetworkModal
                    connectionId={connectionId}
                    editingSocialNetwork={row}
                    disclosure={
                      <ButtonQuickAction
                        icon={CapUIIcon.Pencil}
                        size={CapUIIconSize.Md}
                        variantColor="hierarchy"
                        label={intl.formatMessage({ id: 'global.edit' })}
                      />
                    }
                  />
                  <ButtonQuickAction
                    icon={CapUIIcon.Trash}
                    size={CapUIIconSize.Md}
                    variantColor="danger"
                    label={intl.formatMessage({ id: 'global.delete' })}
                    onClick={() => setSocialNetworkToDelete(row)}
                  />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

export default SocialNetworkList
