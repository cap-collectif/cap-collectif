// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { baseUrl } from '../../../config';

type Props = {
  emailAddress: string,
};

const ParisUserNotValidModal = ({ emailAddress }: Props) => {
  return (
    <Modal
      animation={false}
      show
      onHide={() => {}}
      bsSize="small"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="registration.email.subject" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="please-confirm-your-email-address-to-participate" /> <br />
        <FormattedMessage
          id="you-have-received-an-email-on-your-email-address"
          values={{ emailAddress }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          bsStyle="primary"
          onClick={() => {
            window.location.replace(baseUrl);
          }}>
          <FormattedMessage id="global.close" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ParisUserNotValidModal;
