import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { CustomPageItem_page$key } from '@relay/CustomPageItem_page.graphql'
import { ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Link, Table, Tag, Text, Tooltip } from '@cap-collectif/ui'
import DeleteCustomPageConfirmationModal from './DeleteCustomPageConfirmationModal'

type Props = {
  page: CustomPageItem_page$key
  connectionId: string
}

const FRAGMENT = graphql`
  fragment CustomPageItem_page on Page {
    id
    title
    url
    isEnabled
    updatedAt
    menuItems {
      id
      title
    }
  }
`

const TITLE_MAX_LENGTH = 128

const CustomPageItem: React.FC<Props> = ({ page: pageFragment, connectionId }) => {
  const page = useFragment(FRAGMENT, pageFragment)
  const intl = useIntl()
  const editUrl = `/admin-next/custom-page?id=${page.id}`
  const title = page.title ?? ''
  const menuItemTitles = page.menuItems.map(menuItem => menuItem.title).filter(Boolean)

  return (
    <>
      <Table.Td>
        {title.length > TITLE_MAX_LENGTH ? (
          <Tooltip label={title}>
            <Link truncate={TITLE_MAX_LENGTH} href={editUrl}>
              {title}
            </Link>
          </Tooltip>
        ) : (
          <Link href={editUrl}>{title}</Link>
        )}
      </Table.Td>
      <Table.Td>
        <Link href={page.url} target="_blank" rel="noopener noreferrer">
          {page.url}
        </Link>
      </Table.Td>
      <Table.Td>
        {page.isEnabled ? (
          <Tag variantColor="success">{intl.formatMessage({ id: 'global.yes' })}</Tag>
        ) : (
          <Tag variantColor="infoGray">{intl.formatMessage({ id: 'global.no' })}</Tag>
        )}
      </Table.Td>
      <Table.Td>{menuItemTitles.length > 0 ? <Text>{menuItemTitles.join(', ')}</Text> : null}</Table.Td>
      <Table.Td>
        {page.updatedAt
          ? intl.formatDate(page.updatedAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center" gap={2}>
          <ButtonQuickAction
            icon={CapUIIcon.Pencil}
            size={CapUIIconSize.Md}
            variantColor="primary"
            label={`${intl.formatMessage({ id: 'global.edit' })} ${title}`}
            onClick={() => (window.location.href = editUrl)}
          />
          <DeleteCustomPageConfirmationModal title={title} pageId={page.id} connectionId={connectionId} />
        </Flex>
      </Table.Td>
    </>
  )
}

export default CustomPageItem
