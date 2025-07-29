import { useEffect, useState, type FC } from 'react'
import { useIntl } from 'react-intl'
import { Modal, Heading, CapUIModalSize, Box, Flex, Button } from '@cap-collectif/ui'
import copy from 'copy-to-clipboard'
import { Media, MediaTags } from './utils'

interface MediaModalProps {
  onClose: () => void
  onDelete: (ids: string[]) => void
  media: Media
}

const MediaModal: FC<MediaModalProps> = ({ onClose, onDelete, media }) => {
  const intl = useIntl()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      if (isCopied) {
        setIsCopied(false)
      }
    }, 1500)
  }, [isCopied])

  return (
    <Modal
      show
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'global.image_uploader.image.preview' })}
      size={CapUIModalSize.Lg}
      minWidth="720px"
    >
      <Modal.Header>
        <Heading>{media.name}</Heading>
      </Modal.Header>
      <Modal.Body p={0} pt={0} bg="gray.100">
        <Box as="img" loading="lazy" width="100%" height="100%" src={media.url} sx={{ objectFit: 'contain' }} />
      </Modal.Body>
      <Modal.Footer justify="space-between">
        <MediaTags media={media} />
        <Flex spacing={6}>
          <Button variantSize="big" variant="tertiary" variantColor="danger" onClick={() => onDelete([media.id])}>
            {intl.formatMessage({ id: 'global.delete' })}
          </Button>
          <Button
            variantSize="big"
            variant="secondary"
            variantColor="primary"
            onClick={() => {
              copy(media.url)
              setIsCopied(true)
            }}
          >
            {intl.formatMessage({ id: isCopied ? 'copied-link' : 'copy-link' })}
          </Button>
          <Button variantSize="big" variant="primary" variantColor="primary" onClick={onClose}>
            {intl.formatMessage({ id: 'global.close' })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}

export default MediaModal
