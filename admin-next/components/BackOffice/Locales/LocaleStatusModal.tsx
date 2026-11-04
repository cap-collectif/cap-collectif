import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import UpdateLocaleStatusMutation from '@mutations/UpdateLocaleStatusMutation'
import { LocalesListQuery$data } from '@relay/LocalesListQuery.graphql'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

type Props = {
  locales: LocalesListQuery$data['availableLocales']
  removeId?: string
  onClose: () => void
}

export default function LocaleStatusModal({ locales, removeId, onClose }: Props) {
  const intl = useIntl()
  const { control, handleSubmit, formState } = useForm<{ enabled: Record<string, boolean> }>({
    defaultValues: { enabled: Object.fromEntries(locales.map(locale => [locale.id, locale.isEnabled])) },
  })
  const title = intl.formatMessage({
    id: removeId ? 'are-you-sure-you-want-to-delete-this-language' : 'add-a-language',
  })
  const onSubmit = handleSubmit(async ({ enabled }) => {
    const changes = removeId
      ? [{ id: removeId, isEnabled: false, isPublished: false }]
      : locales
          .filter(locale => !locale.isPublished && !locale.isDefault && locale.isEnabled !== enabled[locale.id])
          .map(({ id }) => ({
            id,
            isEnabled: enabled[id],
          }))
    try {
      await UpdateLocaleStatusMutation.commit({ input: { locales: changes } })
      if (removeId) dangerToast(intl.formatMessage({ id: 'the-language-has-been-removed' }))
      else successToast(intl.formatMessage({ id: 'admin.update.successful' }))
      onClose()
    } catch {
      mutationErrorToast(intl)
    }
  })

  return (
    <Modal show size={CapUIModalSize.Md} ariaLabel={title} onClose={onClose}>
      <Modal.Header>
        <Heading>{title}</Heading>
      </Modal.Header>
      <Modal.Body>
        {removeId ? (
          <Text>{intl.formatMessage({ id: 'translation-help-text' })}</Text>
        ) : (
          locales.map(locale => (
            <FormControl key={locale.id} name={`enabled.${locale.id}`} control={control}>
              <FieldInput
                type="checkbox"
                id={`enable-${locale.id}`}
                name={`enabled.${locale.id}`}
                control={control}
                disabled={locale.isDefault || locale.isPublished}
              >
                {intl.formatMessage({ id: locale.traductionKey })}
              </FieldInput>
            </FormControl>
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variantSize="big" variant="secondary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button
          variantSize="big"
          variantColor={removeId ? 'danger' : 'primary'}
          disabled={!removeId && !formState.isDirty}
          isLoading={formState.isSubmitting}
          onClick={onSubmit}
        >
          {intl.formatMessage({ id: removeId ? 'global.delete' : 'global.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
