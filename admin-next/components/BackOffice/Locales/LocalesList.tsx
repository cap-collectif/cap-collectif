import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIIcon,
  Flex,
  FormLabel,
  Select,
  Switch,
  Table,
  Tag,
  Text,
} from '@cap-collectif/ui'
import SetDefaultLocaleMutation from '@mutations/SetDefaultLocaleMutation'
import UpdateLocaleStatusMutation from '@mutations/UpdateLocaleStatusMutation'
import { LocalesListQuery } from '@relay/LocalesListQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import LocaleStatusModal from './LocaleStatusModal'

const QUERY = graphql`
  query LocalesListQuery {
    availableLocales(includeDisabled: true) {
      id
      traductionKey
      isEnabled
      isPublished
      isDefault
    }
  }
`

type ModalState = { type: 'add' } | { type: 'remove'; id: string }

export default function LocalesList() {
  const intl = useIntl()
  const { availableLocales } = useLazyLoadQuery<LocalesListQuery>(QUERY, {})
  const [modal, setModal] = React.useState<ModalState | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const enabled = availableLocales.filter(locale => locale.isEnabled)
  const currentDefault = enabled.find(locale => locale.isDefault)
  // The server only accepts a published locale as the default one.
  const defaultOptions = enabled
    .filter(locale => locale.isPublished)
    .map(locale => ({ value: locale.id, label: intl.formatMessage({ id: locale.traductionKey }) }))

  const save = async (commit: () => Promise<unknown>) => {
    setIsSaving(true)
    try {
      await commit()
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    } finally {
      setIsSaving(false)
    }
  }
  const onClose = () => setModal(null)
  return (
    <Box bg="white" p="lg" borderRadius={pxToRem(8)}>
      <Button variantSize="small" leftIcon={CapUIIcon.Add} mb="md" onClick={() => setModal({ type: 'add' })}>
        {intl.formatMessage({ id: 'add-a-language' })}
      </Button>
      <Text mb="md" color="gray.600">
        {intl.formatMessage({ id: 'multi-language-help-text' })}
      </Text>
      {/* Saved on change, outside react-hook-form, so the label/field spacing is set by hand */}
      <Flex direction="column" spacing="xxs" mb="md" maxWidth={pxToRem(300)}>
        <FormLabel htmlFor="defaultLocale" label={intl.formatMessage({ id: 'default-language' })} />
        <Select
          inputId="defaultLocale"
          options={defaultOptions}
          value={defaultOptions.find(option => option.value === currentDefault?.id) ?? null}
          isDisabled={isSaving}
          onChange={option => {
            const id = option?.value
            if (id && id !== currentDefault?.id) {
              save(() => SetDefaultLocaleMutation.commit({ input: { id } }, currentDefault?.id))
            }
          }}
        />
      </Flex>
      <Table emptyMessage={<Box />}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'global-languages' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.published' })}</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {enabled.map(locale => {
            const name = intl.formatMessage({ id: locale.traductionKey })
            return (
              <Table.Tr key={locale.id} rowId={locale.id}>
                <Table.Td>
                  <Flex align="center" gap="xs">
                    {name}
                    {locale.isDefault && <Tag variantColor="info">{intl.formatMessage({ id: 'by-default' })}</Tag>}
                  </Flex>
                </Table.Td>
                <Table.Td>
                  {/* Exception to the "Switch in the edit modal" rule: an edit modal adds nothing on this page */}
                  <Switch
                    id={`publish-${locale.id}`}
                    aria-label={`${intl.formatMessage({ id: 'global.published' })} · ${name}`}
                    checked={locale.isPublished}
                    // The default locale must stay published
                    disabled={locale.isDefault || isSaving}
                    onChange={() =>
                      save(() =>
                        UpdateLocaleStatusMutation.commit({
                          input: { locales: [{ id: locale.id, isPublished: !locale.isPublished }] },
                        }),
                      )
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <Flex justifyContent="center">
                    {!locale.isDefault && (
                      <ButtonQuickAction
                        icon={CapUIIcon.Trash}
                        variantColor="danger"
                        label={`${intl.formatMessage({ id: 'global.delete' })} · ${name}`}
                        onClick={() => setModal({ type: 'remove', id: locale.id })}
                      />
                    )}
                  </Flex>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
      {modal && (
        <LocaleStatusModal
          locales={availableLocales}
          removeId={modal.type === 'remove' ? modal.id : undefined}
          onClose={onClose}
        />
      )}
    </Box>
  )
}
