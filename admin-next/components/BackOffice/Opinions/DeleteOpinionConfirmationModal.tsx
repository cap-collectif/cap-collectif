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
import { buildToastUrl } from '@components/ParticipationWorkflow/utils/buildToastUrl'
import DeleteOpinionAdminMutation from '@mutations/DeleteOpinionAdminMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { OPINIONS_URL } from './utils'

type Props = {
  readonly title: string
  readonly opinionId: string
  // Only given by the list: the edit page redirects to the list after the deletion
  readonly connectionId?: string
}

const deleteOpinion = async (
  opinionId: string,
  connectionId: string | undefined,
  hide: () => void,
  intl: IntlShape,
) => {
  hide()
  return await DeleteOpinionAdminMutation.commit({
    input: { id: opinionId },
    connections: connectionId ? [connectionId] : [],
  })
    .then(response => {
      if (response.deleteOpinionAdmin?.errorCode) {
        mutationErrorToast(intl)
        return
      }
      if (!connectionId) {
        window.location.href = buildToastUrl(OPINIONS_URL, {
          variant: 'danger',
          message: 'admin.opinions.successfully-deleted',
        })
        return
      }
      dangerToast(intl.formatMessage({ id: 'admin.opinions.successfully-deleted' }))
    })
    .catch(() => mutationErrorToast(intl))
}

const DeleteOpinionConfirmationModal = ({ title, opinionId, connectionId }: Props): JSX.Element => {
  const intl = useIntl()

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        connectionId ? (
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Sm}
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
          <Modal.Footer spacing="xs">
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                data-cy="deletion-confirmation"
                onClick={() => deleteOpinion(opinionId, connectionId, hide, intl)}
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

export default DeleteOpinionConfirmationModal
