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
import DeleteMenuItemMutation from '@mutations/DeleteMenuItemMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'

type Props = {
  readonly title: string
  readonly menuItemId: string
  readonly connectionId?: string
  readonly hasChildren?: boolean
}

const deleteMenuItem = async (
  menuItemId: string,
  connectionId: string | undefined,
  hide: () => void,
  intl: IntlShape,
) => {
  hide()
  return await DeleteMenuItemMutation.commit({
    input: { id: menuItemId },
    connections: connectionId ? [connectionId] : [],
  })
    .then(response => {
      if (response.deleteMenuItem?.errorCode) {
        mutationErrorToast(intl)
        return
      }
      dangerToast(intl.formatMessage({ id: 'admin.menu-items.successfully-deleted' }))
      // Deleted from the edition page: go back to the list
      if (!connectionId) {
        window.location.href = '/admin-next/menu-items'
      }
    })
    .catch(() => mutationErrorToast(intl))
}

const DeleteMenuItemConfirmationModal = ({
  title,
  menuItemId,
  connectionId,
  hasChildren = false,
}: Props): JSX.Element => {
  const intl = useIntl()

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        connectionId ? (
          <ButtonQuickAction
            type="button"
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Md}
            variantColor="danger"
            label={intl.formatMessage({ id: 'admin.menu-items.delete' }, { title })}
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
            {/* Children are kept (ON DELETE SET NULL) and become root items */}
            {hasChildren ? (
              <Text mt={2}>{intl.formatMessage({ id: 'admin.menu-items.delete-children-warning' })}</Text>
            ) : null}
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
                onClick={() => deleteMenuItem(menuItemId, connectionId, hide, intl)}
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

export default DeleteMenuItemConfirmationModal
