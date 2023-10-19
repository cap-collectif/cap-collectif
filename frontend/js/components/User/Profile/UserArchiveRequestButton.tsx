import * as React from 'react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { FormattedMessage, FormattedHTMLMessage, useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Button, Modal } from 'react-bootstrap'
import type { UserArchiveRequestButton_viewer } from '~relay/UserArchiveRequestButton_viewer.graphql'
import CloseButton from '../../Form/CloseButton'
import { baseUrl } from '~/config'
import RequestUserArchiveMutation from '../../../mutations/RequestUserArchiveMutation'
type Props = {
  readonly viewer: UserArchiveRequestButton_viewer
}
export const UserArchiveRequestButton = ({ viewer }: Props) => {
  const { isArchiveReady, isArchiveDeleted, email, firstArchive } = viewer
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  const [loading, setLoading] = React.useState<boolean>(false)
  let translationKey = loading ? 'global.loading' : 'request-my-copy'
  let disabled = loading

  const handleButtonClick = async () => {
    if ((isArchiveReady && !isArchiveDeleted) || isArchiveDeleted) {
      window.open(`${baseUrl}/profile/download_archive`, '_blank')
    } else {
      setLoading(true)
      await RequestUserArchiveMutation.commit({})
      setLoading(false)
      onOpen()
    }
  }

  if (!firstArchive) {
    if (!isArchiveReady && !isArchiveDeleted) {
      translationKey = loading ? 'global.loading' : 'preparation-in-progress'
      disabled = loading || true
    } else if (isArchiveReady && !isArchiveDeleted) {
      translationKey = loading ? 'global.loading' : 'download-my-copy'
      disabled = loading || false
    } else if (isArchiveDeleted) {
      translationKey = loading ? 'global.loading' : 'download-my-copy'
      disabled = loading || false
    }
  }

  return (
    <div>
      <Button disabled={disabled} bsStyle="primary" onClick={handleButtonClick}>
        <FormattedMessage id={translationKey} />
      </Button>
      <Modal animation={false} show={isOpen} onHide={onClose} aria-labelledby="contained-modal-title-lg">
        <Modal.Header
          closeButton
          closeLabel={intl.formatMessage({
            id: 'close.modal',
          })}
        >
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="copy-request-registered" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedHTMLMessage
            id="data-copy-request-modal-text"
            values={{
              emailAddress: email,
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton label="global.close" onClose={onClose} />
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default createFragmentContainer(UserArchiveRequestButton, {
  viewer: graphql`
    fragment UserArchiveRequestButton_viewer on User {
      email
      isArchiveReady
      isArchiveDeleted
      firstArchive
    }
  `,
})
