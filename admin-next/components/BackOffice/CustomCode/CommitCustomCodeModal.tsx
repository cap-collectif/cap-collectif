import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CommitFields } from './CommitFields'
import { CommitFormControl } from './customCodeVersioning.types'

type CommitCustomCodeModalProps = {
  canSubmit: boolean
  control: CommitFormControl
  errorMessage: string | null
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export const CommitCustomCodeModal: FC<CommitCustomCodeModalProps> = ({
  canSubmit,
  control,
  errorMessage,
  isLoading,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl()

  return isOpen ? (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.commit-modal-aria' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.commit-modal-title' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <CommitFields control={control} errorMessage={errorMessage} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" variantColor="hierarchy" onClick={onClose}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit} isLoading={isLoading} onClick={onSubmit}>
          {intl.formatMessage({ id: 'global.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null
}
