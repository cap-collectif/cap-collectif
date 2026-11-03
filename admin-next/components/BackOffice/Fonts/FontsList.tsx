import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Flex,
  Heading,
  Modal,
  Radio,
  Table,
  Text,
} from '@cap-collectif/ui'
import ChangeFontMutation from '@mutations/ChangeFontMutation'
import DeleteFontMutation from '@mutations/DeleteFontMutation'
import { FontsListQuery } from '@relay/FontsListQuery.graphql'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { fetchQuery, graphql, useLazyLoadQuery, useRelayEnvironment } from 'react-relay'
import FontUpload from './FontUpload'

const QUERY = graphql`
  query FontsListQuery {
    fonts {
      id
      name
      familyName
      useAsBody
      useAsHeading
      isCustom
    }
    variants: fonts(splitFontsFromSameFile: true) {
      name
      weight
      style
      file {
        url(format: "reference")
      }
    }
  }
`

export default function FontsList() {
  const intl = useIntl()
  const environment = useRelayEnvironment()
  const { fonts, variants } = useLazyLoadQuery<FontsListQuery>(QUERY, {})
  const [busy, setBusy] = React.useState(false)
  const [removeId, setRemoveId] = React.useState<string | null>(null)
  const refresh = () => fetchQuery<FontsListQuery>(environment, QUERY, {}).toPromise()
  const heading = fonts.find(font => font.useAsHeading)
  const body = fonts.find(font => font.useAsBody)
  const changeFont = async (id: string, usage: 'heading' | 'body') => {
    setBusy(true)
    try {
      const { changeFont } = await ChangeFontMutation.commit({
        input: {
          heading: usage === 'heading' ? id : heading?.id ?? id,
          body: usage === 'body' ? id : body?.id ?? id,
        },
      })
      if (!changeFont) {
        mutationErrorToast(intl)
        return
      }
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    } finally {
      setBusy(false)
    }
  }

  const removedFont = fonts.find(font => font.id === removeId)
  const deleteFont = async () => {
    if (!removedFont) return
    setBusy(true)
    try {
      const { deleteFont } = await DeleteFontMutation.commit({ input: { id: removedFont.id } })
      if (!deleteFont?.deletedFontId) {
        mutationErrorToast(intl)
        return
      }
      setRemoveId(null)
      // The server removes every variant of the family and may reassign either usage.
      await refresh()
      dangerToast(intl.formatMessage({ id: 'success.delete.flash' }, { name: removedFont.name }))
    } catch {
      mutationErrorToast(intl)
    } finally {
      setBusy(false)
    }
  }

  const confirmTitle = intl.formatMessage({ id: 'confirmation-delete-custom-typeface' })
  const headingLabel = intl.formatMessage({ id: 'admin.fields.group.title' })
  const bodyLabel = intl.formatMessage({ id: 'text.body' })
  return (
    <Box bg="white" p={6} borderRadius="8px">
      <style>
        {variants
          .filter(font => font.file?.url)
          .map(
            font =>
              `@font-face { font-family: ${JSON.stringify(font.name)}; src: url(${JSON.stringify(
                font.file?.url,
              )}); font-weight: ${font.weight || '400'}; font-style: ${font.style || 'normal'}; font-display: swap; }`,
          )
          .join('\n')}
      </style>
      <Text mb={4}>{intl.formatMessage({ id: 'font-setting-saved-in-real-time' })}</Text>
      <FontUpload busy={busy} setBusy={setBusy} refresh={refresh} />
      <Table emptyMessage={<Box />}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'group.title' })}</Table.Th>
            <Table.Th>{headingLabel}</Table.Th>
            <Table.Th>{bodyLabel}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fonts.map(font => (
            <Table.Tr key={font.id} rowId={font.id}>
              <Table.Td>
                <Text style={{ fontFamily: font.familyName }}>{font.name}</Text>
              </Table.Td>
              <Table.Td>
                <Radio
                  id={`heading-${font.id}`}
                  name="heading"
                  aria-label={`${headingLabel} – ${font.name}`}
                  checked={font.useAsHeading}
                  isDisabled={busy}
                  onChange={() => changeFont(font.id, 'heading')}
                />
              </Table.Td>
              <Table.Td>
                <Radio
                  id={`body-${font.id}`}
                  name="body"
                  aria-label={`${bodyLabel} – ${font.name}`}
                  checked={font.useAsBody}
                  isDisabled={busy}
                  onChange={() => changeFont(font.id, 'body')}
                />
              </Table.Td>
              <Table.Td>
                <Flex justifyContent="center">
                  {font.isCustom && (
                    <ButtonQuickAction
                      variantColor="danger"
                      icon={CapUIIcon.Trash}
                      label={`${intl.formatMessage({ id: 'global.delete' })} · ${font.name}`}
                      disabled={busy}
                      onClick={() => setRemoveId(font.id)}
                    />
                  )}
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {removeId && (
        <Modal show size={CapUIModalSize.Md} ariaLabel={confirmTitle} onClose={() => setRemoveId(null)}>
          <Modal.Header>
            <Heading>{confirmTitle}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{removedFont?.name}</Text>
            {(removedFont?.useAsHeading || removedFont?.useAsBody) && (
              // FontRepository uses Open Sans when a selected custom family is removed.
              <Text>{intl.formatMessage({ id: 'by-default' })} · Open Sans</Text>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variantSize="big" variant="secondary" onClick={() => setRemoveId(null)}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button variantSize="big" variantColor="danger" isLoading={busy} onClick={deleteFont}>
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Box>
  )
}
