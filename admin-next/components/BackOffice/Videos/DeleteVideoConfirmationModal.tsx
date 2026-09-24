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
import DeleteVideoMutation from '@mutations/DeleteVideoMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'

type Props = {
  readonly title: string
  readonly videoId: string
  readonly connectionId?: string
}

const deleteVideo = async (videoId: string, connectionId: string | undefined, hide: () => void, intl: IntlShape) => {
  hide()
  return await DeleteVideoMutation.commit({
    input: { id: videoId },
    connections: connectionId ? [connectionId] : [],
  })
    .then(() => {
      dangerToast(intl.formatMessage({ id: 'admin.videos.successfully-deleted' }))
      if (!connectionId) {
        window.location.href = '/admin-next/videos'
      }
    })
    .catch(() => mutationErrorToast(intl))
}

const DeleteVideoConfirmationModal = ({ title, videoId, connectionId }: Props): JSX.Element | null => {
  const intl = useIntl()

  if (!videoId) {
    return null
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({
        id: 'delete-confirmation',
      })}
      disclosure={
        connectionId ? (
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Md}
            variantColor="danger"
            label={intl.formatMessage({ id: 'global.delete' })}
          />
        ) : (
          <Button variant="secondary" variantColor="danger" variantSize="small">
            {intl.formatMessage({
              id: 'admin.global.delete',
            })}
          </Button>
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'delete-confirmation',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: title })}</Text>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({
                  id: 'cancel',
                })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                data-cy="deletion-confirmation"
                onClick={() => deleteVideo(videoId, connectionId, hide, intl)}
              >
                {intl.formatMessage({
                  id: 'global.delete',
                })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default DeleteVideoConfirmationModal
