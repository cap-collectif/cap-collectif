import { Box, Flex, Icon, Table, Tag, Text } from '@cap-collectif/ui'
import { FooterSocialNetworksListQuery } from '@relay/FooterSocialNetworksListQuery.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import FooterSocialNetworkModal from './FooterSocialNetworkModal'
import { CONNECTION_NODES_PER_PAGE, getStyleIcon } from './utils'

export const QUERY = graphql`
  query FooterSocialNetworksListQuery($count: Int!) {
    footerSocialNetworks(first: $count) @connection(key: "FooterSocialNetworksList_footerSocialNetworks") {
      __id
      totalCount
      edges {
        node {
          id
          title
          link
          style
          isEnabled
          position
        }
      }
    }
  }
`

const FooterSocialNetworksList: React.FC = () => {
  const intl = useIntl()
  const query = useLazyLoadQuery<FooterSocialNetworksListQuery>(QUERY, { count: CONNECTION_NODES_PER_PAGE })
  const connectionId = query.footerSocialNetworks?.__id
  const nodes = React.useMemo(
    () =>
      query.footerSocialNetworks?.edges
        ?.map(edge => edge?.node)
        .filter((node): node is NonNullable<typeof node> => !!node) ?? [],
    [query.footerSocialNetworks?.edges],
  )

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Flex mb={4}>
        <FooterSocialNetworkModal connectionId={connectionId} />
      </Flex>
      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'global.title' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.link' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'admin.fields.footer_social_network.style' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.position' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.published' })}</Table.Th>
            <Table.Th noPlaceholder />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {nodes.map(node => (
            <Table.Tr key={node.id} rowId={node.id}>
              <Table.Td>
                <Text truncate={64}>{node.title}</Text>
              </Table.Td>
              <Table.Td>
                <Text truncate={64}>{node.link}</Text>
              </Table.Td>
              <Table.Td>
                <Icon name={getStyleIcon(node.style)} />
              </Table.Td>
              <Table.Td>{node.position}</Table.Td>
              <Table.Td>
                <Tag variantColor={node.isEnabled ? 'success' : 'infoGray'}>
                  {intl.formatMessage({ id: node.isEnabled ? 'global.yes' : 'global.no' })}
                </Tag>
              </Table.Td>
              <Table.Td>
                <Flex justify="flex-end">
                  <FooterSocialNetworkModal connectionId={connectionId} footerSocialNetwork={node} />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

export default FooterSocialNetworksList
