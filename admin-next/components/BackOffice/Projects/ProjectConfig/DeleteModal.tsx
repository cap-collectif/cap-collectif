import { FC } from 'react'
import { Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

type DeleteModalProps = {
  onClose: () => void
  onDelete: () => void
}

const DeleteModal: FC<DeleteModalProps> = ({ onDelete, onClose }) => {
  const intl = useIntl()

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'group.admin.step.modal.delete.content' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'group.admin.step.modal.delete.content' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text mt={1} mb={2}>
          {intl.formatMessage({ id: 'global-action-irreversible' })}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onClose} variant="secondary" variantSize="big" variantColor="hierarchy">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button type="button" variantColor="danger" variantSize="big" onClick={onDelete}>
          {intl.formatMessage({ id: 'action_delete' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteModal
