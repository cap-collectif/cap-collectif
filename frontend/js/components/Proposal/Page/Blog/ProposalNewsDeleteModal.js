// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import SubmitButton from '../../../Form/SubmitButton';
import CloseButton from '../../../Form/CloseButton';
import type { ProposalNewsDeleteModal_post } from '~relay/ProposalNewsDeleteModal_post.graphql';

type Props = {
  +post: ProposalNewsDeleteModal_post,
  +showDeleteModal: boolean,
  +displayDeleteModal: (show: boolean) => void,
  +onSubmit: (postId: string) => void,
  +onClose?: () => void,
};

export const ProposalNewsDeleteModal = ({
  post,
  showDeleteModal,
  onSubmit,
  displayDeleteModal,
}: Props) => {
  if (!post) return null;
  return (
    <Modal
      animation={false}
      show={showDeleteModal}
      onHide={() => displayDeleteModal(false)}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
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
            onSubmit(post.id);
          }}
          label="global.removeDefinitively"
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

const container = connect()(ProposalNewsDeleteModal);

export default createFragmentContainer(container, {
  post: graphql`
    fragment ProposalNewsDeleteModal_post on Post {
      id
    }
  `,
});
