import { Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CommitFields } from './CommitFields'
import { CommitFormControl, Version } from './customCodeVersioning.types'

type RestoreCustomCodeModalProps = {
  canSubmit: boolean
  control: CommitFormControl
  errorMessage: string | null
  isLoading: boolean
  version: Version | null
  onClose: () => void
  onSubmit: () => void
}

export const RestoreCustomCodeModal: FC<RestoreCustomCodeModalProps> = ({
  canSubmit,
  control,
  errorMessage,
  isLoading,
  version,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl()

  return version ? (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.restore-modal-aria' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.restore-modal-title' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text color="gray.700" mb={4}>
          {intl.formatMessage({ id: 'admin.custom-code.restore-modal-description' }, { title: version.title })}
        </Text>
        <CommitFields control={control} errorMessage={errorMessage} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" variantColor="hierarchy" onClick={onClose}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit} isLoading={isLoading} onClick={onSubmit}>
          {intl.formatMessage({ id: 'admin.custom-code.restore' })}
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null
}
