// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { type ContactFormAdminModal_contactForm } from '~relay/ContactFormAdminModal_contactForm.graphql';
import CloseButton from '../../Form/CloseButton';
import ContactFormAdminForm from './ContactFormAdminForm';

type Props = {|
  show: boolean,
  contactForm?: ContactFormAdminModal_contactForm,
  onClose: Function,
|};

const ContactFormAdminModal = ({ contactForm, show, onClose }: Props) => (
  <Modal
    id={contactForm ? `show-contactForm-modal-${contactForm.id}` : 'show-contactForm-modal'}
    className="reply__modal--show"
    animation={false}
    onHide={onClose}
    show={show}
    bsSize="large"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-lg">
        <FormattedMessage id={contactForm ? 'modify-form' : 'new-form'} />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ContactFormAdminForm contactForm={contactForm} onClose={onClose} />
    </Modal.Body>
    <Modal.Footer>
      {/* $FlowFixMe $refType */}
      <CloseButton onClose={onClose} />
    </Modal.Footer>
  </Modal>
);

export default createFragmentContainer(ContactFormAdminModal, {
  contactForm: graphql`
    fragment ContactFormAdminModal_contactForm on ContactForm {
      id
      title
      ...ContactFormAdminForm_contactForm
    }
  `,
});
