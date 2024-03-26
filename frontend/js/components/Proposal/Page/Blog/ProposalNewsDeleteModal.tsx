import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Modal } from 'react-bootstrap'
import SubmitButton from '../../../Form/SubmitButton'
import CloseButton from '../../../Form/CloseButton'
import type { ProposalNewsDeleteModal_post } from '~relay/ProposalNewsDeleteModal_post.graphql'
type Props = {
  readonly post: ProposalNewsDeleteModal_post
  readonly showDeleteModal: boolean
  readonly displayDeleteModal: (show: boolean) => void
  readonly onSubmit: (postId: string) => void
  readonly onClose?: () => void
}
export const ProposalNewsDeleteModal = ({ post, showDeleteModal, onSubmit, displayDeleteModal }: Props) => {
  const intl = useIntl()
  if (!post) return null
  return (
    <Modal
      animation={false}
      show={showDeleteModal}
      onHide={() => displayDeleteModal(false)}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg"
    >
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="contained-modal-title-lg" className="uppercase">
          <FormattedMessage tagName="b" id="global.removeActuality" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedHTMLMessage tagName="p" id="global.confirm-delete" />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={() => displayDeleteModal(false)} />
        <SubmitButton
          id="confirm-post-delete"
          onSubmit={() => {
            onSubmit(post.id)
          }}
          label="global.removeDefinitively"
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  )
}
// @ts-ignore
const container = connect()(ProposalNewsDeleteModal)
export default createFragmentContainer(container, {
  post: graphql`
    fragment ProposalNewsDeleteModal_post on Post {
      id
    }
  `,
})
