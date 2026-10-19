import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { ThemeItem_theme$key } from '@relay/ThemeItem_theme.graphql'
import { ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Link, Table, Tag, Text, Tooltip } from '@cap-collectif/ui'
import DeleteThemeConfirmationModal from './DeleteThemeConfirmationModal'
import { THEME_STATUS_LABELS } from './utils'

type Props = {
  theme: ThemeItem_theme$key
  connectionId: string
}

const FRAGMENT = graphql`
  fragment ThemeItem_theme on Theme {
    id
    title
    status
    position
    eventsCount
    postsCount
    isEnabled
    updatedAt
    author {
      displayName
    }
  }
`

const ThemeItem: React.FC<Props> = ({ theme: themeFragment, connectionId }) => {
  const theme = useFragment(FRAGMENT, themeFragment)
  const intl = useIntl()
  const url = `/admin-next/theme?id=${theme.id}`
  const statusLabel = (theme.status && THEME_STATUS_LABELS[theme.status]) || 'global.no_status'

  return (
    <>
      <Table.Td>
        {theme.title.length > 128 ? (
          <Tooltip label={theme.title}>
            <Link truncate={128} href={url}>
              {theme.title}
            </Link>
          </Tooltip>
        ) : (
          <Link truncate={128} href={url}>
            {theme.title}
          </Link>
        )}
      </Table.Td>
      <Table.Td>{theme.author?.displayName ? <Text>{theme.author.displayName}</Text> : null}</Table.Td>
      <Table.Td>{intl.formatMessage({ id: statusLabel })}</Table.Td>
      <Table.Td isNumeric textAlign="left">
        {theme.position}
      </Table.Td>
      <Table.Td isNumeric textAlign="left">
        {theme.eventsCount}
      </Table.Td>
      <Table.Td isNumeric textAlign="left">
        {theme.postsCount}
      </Table.Td>
      <Table.Td>
        {theme.isEnabled ? (
          <Tag variantColor="success">{intl.formatMessage({ id: 'global.yes' })}</Tag>
        ) : (
          <Tag variantColor="infoGray">{intl.formatMessage({ id: 'global.no' })}</Tag>
        )}
      </Table.Td>
      <Table.Td>
        {theme.updatedAt
          ? intl.formatDate(theme.updatedAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center" gap={2}>
          <ButtonQuickAction
            as="a"
            href={url}
            icon={CapUIIcon.Pencil}
            size={CapUIIconSize.Md}
            variantColor="primary"
            label={intl.formatMessage({ id: 'admin.themes.edit' }, { title: theme.title })}
          />
          <DeleteThemeConfirmationModal title={theme.title} themeId={theme.id} connectionId={connectionId} />
        </Flex>
      </Table.Td>
    </>
  )
}

export default ThemeItem
