import { Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import DeleteMediaAdminMutation from '@mutations/DeleteMediaAdminMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { useState, type FC } from 'react'
import { useIntl } from 'react-intl'

interface MediaDeleteModalProps {
  onClose: () => void
  medias: string[]
  connectionName?: string
}

const MediaDeleteModal: FC<MediaDeleteModalProps> = ({ onClose, medias, connectionName }) => {
  const intl = useIntl()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onDeleteMedias = () => {
    setIsSubmitting(true)
    return DeleteMediaAdminMutation.commit({
      input: {
        ids: medias,
      },
      connections: [connectionName],
    })
      .then(() => {
        setIsSubmitting(false)
        successToast(intl.formatMessage({ id: 'media-deleted' }, { num: medias.length }))
        onClose()
      })
      .catch(() => {
        setIsSubmitting(false)
        mutationErrorToast(intl)
      })
  }

  return (
    <Modal
      show
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'global.image_uploader.image.preview' })}
      size={CapUIModalSize.Md}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'media-delete-confirm' }, { num: medias.length })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          {intl.formatMessage(
            { id: 'media-delete-helptext' },
            { num: medias.length, b: (...chunks) => <b>{chunks.join('')}</b> },
          )}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <Button variantSize="big" variant="secondary" variantColor="hierarchy" onClick={onClose}>
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button
          variantSize="big"
          variant="primary"
          variantColor="danger"
          isLoading={isSubmitting}
          onClick={onDeleteMedias}
        >
          {intl.formatMessage({ id: 'global.delete' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MediaDeleteModal
