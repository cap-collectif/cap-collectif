import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { MenuItemRow_menuItem$key } from '@relay/MenuItemRow_menuItem.graphql'
import { Flex, Link, Table, Tag, Text } from '@cap-collectif/ui'
import DeleteMenuItemConfirmationModal from './DeleteMenuItemConfirmationModal'
import { getTranslation } from './utils'

type Props = {
  menuItem: MenuItemRow_menuItem$key
  connectionId: string
}

const FRAGMENT = graphql`
  fragment MenuItemRow_menuItem on MenuItem {
    id
    menu
    isEnabled
    isDeletable
    hasChildren
    position
    updatedAt
    translations {
      locale
      title
      link
    }
    parent {
      translations {
        locale
        title
        link
      }
    }
    page {
      title
    }
  }
`

const MenuItemRow: React.FC<Props> = ({ menuItem: menuItemFragment, connectionId }) => {
  const menuItem = useFragment(FRAGMENT, menuItemFragment)
  const intl = useIntl()
  const translation = getTranslation(menuItem.translations, intl.locale)
  const title = translation?.title ?? ''
  const parentTitle = menuItem.parent ? getTranslation(menuItem.parent.translations, intl.locale)?.title : null

  return (
    <>
      <Table.Td>
        <Link truncate={128} href={`/admin-next/menu-item?id=${menuItem.id}`}>
          {title}
        </Link>
      </Table.Td>
      <Table.Td>
        {intl.formatMessage({ id: menuItem.menu === 'FOOTER' ? 'global.footer' : 'menu.type.header' })}
      </Table.Td>
      <Table.Td>
        {menuItem.isEnabled ? (
          <Tag variantColor="success">{intl.formatMessage({ id: 'global.yes' })}</Tag>
        ) : (
          <Tag variantColor="infoGray">{intl.formatMessage({ id: 'global.no' })}</Tag>
        )}
      </Table.Td>
      <Table.Td isNumeric textAlign="left">
        {menuItem.position}
      </Table.Td>
      <Table.Td>{parentTitle ? <Text>{parentTitle}</Text> : null}</Table.Td>
      <Table.Td>{menuItem.page?.title ? <Text>{menuItem.page.title}</Text> : null}</Table.Td>
      <Table.Td>{!menuItem.page && translation?.link ? <Text truncate={64}>{translation.link}</Text> : null}</Table.Td>
      <Table.Td>
        {menuItem.updatedAt
          ? intl.formatDate(menuItem.updatedAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center">
          {menuItem.isDeletable ? (
            <DeleteMenuItemConfirmationModal
              title={title}
              menuItemId={menuItem.id}
              connectionId={connectionId}
              hasChildren={menuItem.hasChildren}
            />
          ) : null}
        </Flex>
      </Table.Td>
    </>
  )
}

export default MenuItemRow
