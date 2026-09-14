import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import { useDeleteSourceCategoryMutation } from '@mutations/DeleteSourceCategoryMutation'
import { mutationErrorToast } from '@shared/utils/toasts'

type Props = {
  sourceCategoryId: string
  connectionId: string
}

export const DeleteSourceCategoryModal: React.FC<Props> = ({ sourceCategoryId, connectionId }) => {
  const intl = useIntl()
  const { commit, isLoading } = useDeleteSourceCategoryMutation()

  const onDelete = (hide: () => void) => {
    commit({
      variables: {
        input: { id: sourceCategoryId },
        connections: [connectionId],
      },
      onCompleted: () => {
        hide()
      },
      onError: () => {
        mutationErrorToast(intl)
      },
    })
  }

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel="modal-title"
      disclosure={
        <ButtonQuickAction
          variantColor="danger"
          icon={CapUIIcon.Trash}
          size={CapUIIconSize.Md}
          label={intl.formatMessage({ id: 'global.delete' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'admin.source-category.delete-title' })}</Heading>
          </Modal.Header>

          <Modal.Body>
            <Text>{intl.formatMessage({ id: 'global.confirm-delete' })}</Text>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button variantColor="danger" variantSize="big" onClick={() => onDelete(hide)} isLoading={isLoading}>
              {intl.formatMessage({ id: 'global.permanently-remove' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default DeleteSourceCategoryModal
