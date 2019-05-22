// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import type { State } from '../../types';

type Props = {
  privacyContent: string,
};

type PrivacyModalState = {
  showModal: boolean,
};

export class PrivacyModal extends React.Component<Props, PrivacyModalState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  render() {
    const { privacyContent } = this.props;
    const { showModal } = this.state;
    return (
      <div className="privacy-policy">
        <div>
          <Button
            id="privacy-policy"
            className="p-0"
            variant="link"
            bsStyle="link"
            onClick={() => {
              this.setState({ showModal: true });
            }}
            name="privacy">
            <FormattedMessage id="confidentialite.title" />
          </Button>
        </div>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          id="privacy-modal"
          className="privacy-policy"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton className="privacy-policy">
            <Modal.Title id="contained-modal-title-lg" className="privacy-policy">
              <FormattedMessage id="privacy-policy" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="content" dangerouslySetInnerHTML={{ __html: privacyContent }} />
          </Modal.Body>
          <Modal.Footer className="privacy-policy">
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

const mapStateToProps = (state: State) => ({
  privacyContent: state.default.parameters['privacy-policy'],
});

export default connect(mapStateToProps)(PrivacyModal);
