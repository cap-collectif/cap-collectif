import { Button, CapUIModalSize, Checkbox, Heading, Modal, Text } from '@cap-collectif/ui'
import { mutationErrorToast } from '@shared/utils/toasts'
import DeleteMediatorMutation from 'mutations/DeleteMediatorMutation'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'

export type MediatorInfos = {
  id: string
  username: string
  contributions: number
  connectionId: string
}

type MediatorDeleteModalProps = {
  onClose: () => void
  mediator: MediatorInfos
  projectId: string
}

const MediatorDeleteModal: FC<MediatorDeleteModalProps> = ({ onClose, mediator }) => {
  const intl = useIntl()
  const [checked, setChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      await DeleteMediatorMutation.commit(
        {
          input: { mediatorId: mediator.id },
        },
        mediator.connectionId,
      )
      setChecked(false)
      setIsSubmitting(false)
      onClose()
    } catch {
      mutationErrorToast(intl)
      setChecked(false)
      setIsSubmitting(false)
      onClose()
    }
  }

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'group.admin.step.modal.delete.content' })}
    >
      <Modal.Header>
        <Heading>
          {intl.formatMessage({ id: 'are-you-sure-to-delete-something' }, { element: mediator.username })}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <Text mt={1}>
          {intl.formatMessage(
            { id: 'mediator.delete_message' },
            { num: mediator.contributions, strong: (...chunks) => <b>{chunks.join('')}</b> },
          )}
        </Text>
        <Text
          fontWeight={600}
          style={{
            textDecoration: 'underline',
          }}
          mb={4}
        >
          {intl.formatMessage({
            id: 'warning-action-irreversible',
          })}
        </Text>
        <Checkbox
          id="agree-checkbox"
          checked={checked}
          onChange={e => setChecked((e.target as HTMLInputElement).checked)}
        >
          {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
        </Checkbox>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onClose} variant="secondary" variantSize="big" variantColor="hierarchy">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          type="button"
          variantColor="danger"
          variantSize="big"
          onClick={onSubmit}
          isLoading={isSubmitting}
          disabled={!checked}
        >
          {intl.formatMessage({ id: 'action_delete' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MediatorDeleteModal
