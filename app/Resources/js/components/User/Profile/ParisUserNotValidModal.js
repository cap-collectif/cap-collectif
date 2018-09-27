// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { baseUrl } from '../../../config';

type Props = {
  emailAddress: string,
};

const onHideModal = () => {
  window.location.replace(`${baseUrl}/logout`);
};

const ParisUserNotValidModal = ({ emailAddress }: Props) => (
  <Modal
    animation={false}
    show
    onHide={onHideModal}
    bsSize="small"
    aria-labelledby="contained-modal-title-lg">
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-lg">
        <FormattedMessage id="registration.email.subject" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        <strong>
          <FormattedMessage id="please-confirm-your-email-address-to-participate" />
        </strong>
      </p>
      <p>
        <FormattedMessage id="please-click-on-the-link-in-the-email" values={{ emailAddress }} />
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="primary" onClick={onHideModal}>
        <FormattedMessage id="global.close" />
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ParisUserNotValidModal;
