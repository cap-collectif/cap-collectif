// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { type ContactFormAdminModal_contactForm } from '~relay/ContactFormAdminModal_contactForm.graphql';
import CloseButton from '~/components/Form/CloseButton';
import ContactFormAdminForm from './ContactFormAdminForm';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';

type Props = {|
  show: boolean,
  contactForm: ?ContactFormAdminModal_contactForm,
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
    <div className="row">
      <div className="col-md-6">
        <h3 className="m-15">
          <FormattedMessage id={contactForm ? 'modify-form' : 'new-form'} />
        </h3>
      </div>
      <div className="col-md-6">
        <div align="right" className="m-15">
          <LanguageButtonContainer />
        </div>
      </div>
    </div>
    <Modal.Body>
      <ContactFormAdminForm contactForm={contactForm} onClose={onClose} />
    </Modal.Body>
    <Modal.Footer>
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
