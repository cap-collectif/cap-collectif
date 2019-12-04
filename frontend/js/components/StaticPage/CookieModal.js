// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import CloseButton from '../Form/CloseButton';
import CookieContent from './CookieContent';

type Props = {
  separator?: string,
};

type CookieModalState = {
  showModal: boolean,
};

export class CookieModal extends React.Component<Props, CookieModalState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  render() {
    const { separator } = this.props;
    const { showModal } = this.state;

    return (
      <div className="cookie-policy">
        <div>
          {separator && <span>{separator}</span>}
          <Button
            id="cookies-management"
            className="p-0"
            variant="link"
            bsStyle="link"
            onClick={() => {
              this.setState({ showModal: true });
            }}
            name="cookies">
            <FormattedMessage id="cookies" />
          </Button>
        </div>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          id="cookies-modal"
          className="cookie-policy"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton className="cookie-policy">
            <Modal.Title id="contained-modal-title-lg" className="cookie-policy">
              <FormattedMessage id="cookies" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <CookieContent />
            </div>
          </Modal.Body>
          <Modal.Footer className="cookie-policy">
            <CloseButton
              buttonId="cookies-cancel"
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default CookieModal;
