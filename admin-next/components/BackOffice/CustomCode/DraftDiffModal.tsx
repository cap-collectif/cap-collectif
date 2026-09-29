import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { DiffView } from './CustomCodeEditor'

type DraftDiffModalProps = {
  isOpen: boolean
  nextContent: string
  previousContent: string
  onClose: () => void
}

export const DraftDiffModal: FC<DraftDiffModalProps> = ({ isOpen, nextContent, previousContent, onClose }) => {
  const intl = useIntl()

  return isOpen ? (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.view-diff' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.draft-diff-title' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <DiffView previousContent={previousContent} nextContent={nextContent} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="primary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null
}
