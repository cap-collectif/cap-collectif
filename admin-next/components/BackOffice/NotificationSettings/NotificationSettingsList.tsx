import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { Box, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Table, Tag } from '@cap-collectif/ui'
import type { NotificationSettingsListQuery } from '@relay/NotificationSettingsListQuery.graphql'
import NotificationSettingModal from './NotificationSettingModal'

export const QUERY = graphql`
  query NotificationSettingsListQuery {
    notificationSettings {
      id
      keyname
      value
      isEnabled
    }
  }
`

const NotificationSettingsList: React.FC = () => {
  const intl = useIntl()
  const { notificationSettings } = useLazyLoadQuery<NotificationSettingsListQuery>(QUERY, {})

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.name' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.enabled' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.value' })}</Table.Th>
            <Table.Th width="10%">{intl.formatMessage({ id: 'admin.settings.header.action' })}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {notificationSettings.map((siteParameter, index) => (
            <Table.Tr key={siteParameter.id} rowId={siteParameter.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>{intl.formatMessage({ id: siteParameter.keyname })}</Table.Td>
              <Table.Td>
                <Tag variantColor={siteParameter.isEnabled ? 'success' : 'infoGray'}>
                  {intl.formatMessage({ id: siteParameter.isEnabled ? 'global.yes' : 'global.no' })}
                </Tag>
              </Table.Td>
              <Table.Td>{siteParameter.value}</Table.Td>
              <Table.Td>
                <Flex justify="flex-end">
                  <NotificationSettingModal
                    siteParameter={siteParameter}
                    disclosure={
                      <ButtonQuickAction
                        icon={CapUIIcon.Pencil}
                        size={CapUIIconSize.Md}
                        variantColor="hierarchy"
                        label={intl.formatMessage({ id: 'global.edit' })}
                      />
                    }
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

export default NotificationSettingsList
