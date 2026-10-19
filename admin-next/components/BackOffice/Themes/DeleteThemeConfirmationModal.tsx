import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import DeleteThemeMutation from '@mutations/DeleteThemeMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'

type Props = {
  readonly title: string
  readonly themeId: string
  // Absent when deleting from the edit page, which then redirects to the list
  readonly connectionId?: string
}

const deleteTheme = async (themeId: string, connectionId: string | undefined, hide: () => void, intl: IntlShape) => {
  hide()
  return await DeleteThemeMutation.commit({
    input: { id: themeId },
    connections: connectionId ? [connectionId] : [],
  })
    .then(response => {
      if (response.deleteTheme?.errorCode) return mutationErrorToast(intl)
      dangerToast(intl.formatMessage({ id: 'admin.themes.successfully-deleted' }))
      if (!connectionId) {
        window.location.href = '/admin-next/themes'
      }
    })
    .catch(() => mutationErrorToast(intl))
}

const DeleteThemeConfirmationModal = ({ title, themeId, connectionId }: Props): JSX.Element | null => {
  const intl = useIntl()

  if (!themeId) {
    return null
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        connectionId ? (
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Md}
            variantColor="danger"
            label={intl.formatMessage({ id: 'admin.themes.delete' }, { title })}
          />
        ) : (
          <Button variant="secondary" variantColor="danger" variantSize="small">
            {intl.formatMessage({ id: 'admin.global.delete' })}
          </Button>
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: title })}</Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                data-cy="deletion-confirmation"
                onClick={() => deleteTheme(themeId, connectionId, hide, intl)}
              >
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default DeleteThemeConfirmationModal
