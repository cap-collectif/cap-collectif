import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import DeletePostMutation from '@mutations/DeletePostMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'

type Props = {
  readonly title: string
  readonly postId: string
}

const deletePost = async (postId: string, hide: () => void, intl: IntlShape) => {
  const input = {
    id: postId,
  }
  hide()
  return await DeletePostMutation.commit({
    input,
    connections: [],
  })
    .then(() => {
      successToast(intl.formatMessage({ id: 'post-successfully-deleted' }))
      window.location.href = '/admin-next/posts'
    })
    .catch(() => mutationErrorToast(intl))
}

const DeletePostConfirmationModal = ({ title, postId }: Props): JSX.Element => {
  const intl = useIntl()

  if (!postId) {
    return null
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({
        id: 'delete-confirmation',
      })}
      disclosure={
        <Button variant="secondary" variantColor="danger" variantSize="small">
          {intl.formatMessage({
            id: 'admin.global.delete',
          })}
        </Button>
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
                onClick={() => deletePost(postId, hide, intl)}
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

export default DeletePostConfirmationModal
