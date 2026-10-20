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
import DeletePageMutation from '@mutations/DeletePageMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'

type Props = {
  readonly title: string
  readonly pageId: string
  readonly connectionId?: string
}

const deletePage = async (pageId: string, connectionId: string | undefined, hide: () => void, intl: IntlShape) => {
  hide()
  return await DeletePageMutation.commit({
    input: { id: pageId },
    connections: connectionId ? [connectionId] : [],
  })
    .then(response => {
      if (response.deletePage?.errorCode) {
        mutationErrorToast(intl)
        return
      }
      dangerToast(intl.formatMessage({ id: 'admin.custom-pages.successfully-deleted' }))
      if (!connectionId) {
        window.location.href = '/admin-next/custom-pages'
      }
    })
    .catch(() => mutationErrorToast(intl))
}

const DeleteCustomPageConfirmationModal = ({ title, pageId, connectionId }: Props): JSX.Element | null => {
  const intl = useIntl()

  if (!pageId) {
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
            label={`${intl.formatMessage({ id: 'global.delete' })} ${title}`}
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
                onClick={() => deletePage(pageId, connectionId, hide, intl)}
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

export default DeleteCustomPageConfirmationModal
