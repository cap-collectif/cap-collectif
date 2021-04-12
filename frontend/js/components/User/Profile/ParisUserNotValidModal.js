// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import { baseUrl } from '~/config';

type Props = {
  emailAddress: string,
};

const onHideModal = () => {
  window.location.replace(`${baseUrl}/logout`);
};

const ParisUserNotValidModal = ({ emailAddress }: Props) => {
  const intl = useIntl();

  return (
    <Modal
      animation={false}
      show
      onHide={onHideModal}
      bsSize="small"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="registration.email.subject" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <FormattedMessage
            id="please-confirm-your-email-address-to-participate"
            tagName="strong"
          />
        </p>
        <FormattedMessage
          id="please-click-on-the-link-in-the-email"
          values={{ emailAddress }}
          tagName="p"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="primary" onClick={onHideModal}>
          <FormattedMessage id="global.close" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ParisUserNotValidModal;
