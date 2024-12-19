import * as React from 'react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'
import {
  Button,
  Heading,
  Modal,
  CapUIModalSize,
  BoxProps,
  Box,
  CapUIIcon,
  Icon,
  CapUIIconSize,
} from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import share from '@shared/utils/share'

const SocialButton: React.FC<{
  name: CapUIIcon
  onClick: () => void
  ariaLabel?: string
}> = ({ onClick, ariaLabel, name }) => (
  <Box
    as="button"
    mr={[4, 6]}
    p={0}
    bg="transparent"
    border="none"
    color="neutral-gray.600"
    width={6}
    aria-label={ariaLabel}
    _hover={{ color: 'neutral-gray.700' }}
    onClick={onClick}
  >
    <Icon name={name} size={CapUIIconSize.Md} />
  </Box>
)

const ShareButtons: React.FC<
  BoxProps & {
    url: string
    title: string
  }
> = ({ url, title, ...rest }) => {
  const share_buttons = useFeatureFlag('share_buttons')
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const renderModal = () => (
    <Modal
      baseId="project-header-share-buttons-modal"
      show={isOpen}
      onClose={onClose}
      ariaLabel={intl.formatMessage({
        id: 'share.link',
      })}
      size={CapUIModalSize.Lg}
    >
      <Modal.Header>
        <Heading>
          {intl.formatMessage({
            id: 'share.link',
          })}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <p className="excerpt">{title}</p>
        <textarea
          title={intl.formatMessage({
            id: 'share.link',
          })}
          readOnly
          rows={3}
        >
          {url}
        </textarea>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" variantSize="medium" onClick={onClose}>
          {intl.formatMessage({
            id: 'global.close',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )

  if (!share_buttons) return null

  return (
    <Box
      position={['absolute', 'relative']}
      right={[0]}
      top={[0]}
      justifyContent={['flex-end', 'flex-start']}
      display="flex"
      flexDirection="row"
      maxHeight={6}
      width="100%"
      flexBasis="100%"
      alignItems="center"
      marginTop={[3, 6]}
      zIndex={2}
      {...rest}
    >
      <SocialButton
        onClick={() => share(title, url, 'facebook')}
        name={CapUIIcon.Facebook}
        ariaLabel={intl.formatMessage({
          id: 'share-link-facebook',
        })}
      />
      <SocialButton
        onClick={() => share(title, url, 'twitter')}
        name={CapUIIcon.X}
        ariaLabel={intl.formatMessage({
          id: 'share-link-twitter',
        })}
      />
      <SocialButton
        onClick={onOpen}
        name={CapUIIcon.Link}
        ariaLabel={intl.formatMessage({
          id: 'open-share-link-modal',
        })}
      />
      {renderModal()}
    </Box>
  )
}

export default ShareButtons
