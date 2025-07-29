import { CapUIIconSize, CapUIModalSize, Heading, Modal, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

export const ModalSkeleton = ({ isNew }: { isNew?: boolean }) => {
  const intl = useIntl()
  return (
    <Modal show size={CapUIModalSize.Xl} height="92%" ariaLabel="">
      <Modal.Header>
        {isNew ? (
          <Modal.Header.Label>{intl.formatMessage({ id: 'mediator.new_participant' })}</Modal.Header.Label>
        ) : null}
        <Heading>
          {intl.formatMessage({ id: isNew ? 'mediator.select_x_proposal' : 'mediator.edit_vote' }, { num: 1 })}
        </Heading>
      </Modal.Header>
      <Modal.Body display="flex" align="center" justify="space-between">
        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
      </Modal.Body>
    </Modal>
  )
}

export default ModalSkeleton
