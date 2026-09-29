import { Box, Button, CapUIModalSize, Heading, Modal, Text } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CustomCodeEditor } from './CustomCodeEditor'

type FullscreenCustomCodeEditorModalProps = {
  draftContent: string
  isOpen: boolean
  keyname: string
  label: string
  onClose: () => void
  onDraftChange: (content: string) => void
}

export const FullscreenCustomCodeEditorModal: FC<FullscreenCustomCodeEditorModalProps> = ({
  draftContent,
  isOpen,
  keyname,
  label,
  onClose,
  onDraftChange,
}) => {
  const intl = useIntl()

  return isOpen ? (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Fullscreen}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.fullscreen-editor' })}
    >
      <Modal.Header>
        <Box>
          <Heading>{intl.formatMessage({ id: 'admin.custom-code.edition-title' }, { label })}</Heading>
          <Text color="gray.700" mt={1}>
            {keyname}
          </Text>
        </Box>
      </Modal.Header>
      <Modal.Body>
        <CustomCodeEditor height="calc(100vh - 210px)" value={draftContent} onChange={onDraftChange} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="primary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null
}
