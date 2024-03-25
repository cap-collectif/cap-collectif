import React from 'react'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

type Props = {
  onClose: () => void
  onSubmit: () => void
}

export const ProposalAssessmentConfirmModal = ({ onClose, onSubmit }: Props) => {
  const intl = useIntl()
  return (
    <Modal
      onClose={onClose}
      show
      hideCloseButton
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'analysis.confirm_publish' })}
    >
      <Modal.Header>
        <Modal.Header.Label as="div">
          {intl.formatMessage({ id: 'analysis.supervisor_modal_label' })}
        </Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'analysis.confirm_publish' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage(
          { id: 'analysis.warning_not_done' },
          {
            b: (...chunks) => <b>{chunks}</b>,
            br: <br />,
          },
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="secondary" variantColor="primary" variantSize="big">
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button onClick={onSubmit} variant="primary" variantColor="primary" variantSize="big">
          {intl.formatMessage({ id: 'global.validate' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProposalAssessmentConfirmModal
