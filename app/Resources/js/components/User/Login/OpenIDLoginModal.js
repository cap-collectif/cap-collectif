// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { closeOpenIDLoginModal } from '../../../redux/modules/user';
import type { Dispatch, State } from '../../../types';

type Props = {
  submitting: boolean,
  show: boolean,
  onClose: Function,
  onSubmit: Function,
};

export class OpenIDLoginModal extends React.Component<Props> {
  render() {
    const { show, onClose, onSubmit } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        autoFocus
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <form id="openid-login-form" onSubmit={onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg" componentClass="h1">
              {<FormattedMessage id="global.login" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button
              bsStyle="primary"
              className="w-100"
              onClick={() => {
                window.location.href = `/login/openid?_destination=${window &&
                  window.location.href}`;
              }}>
              {
                <FormattedHTMLMessage
                  id="continue-as-sso-connected-user"
                  values={{ SsoConnectedUsername: 'Pierre Tondereau' }}
                />
              }
            </Button>
            <p className="mt-15 mb-0 text-center">
              <a href="/">{<FormattedMessage id="change-user" />}</a>
            </p>
          </Modal.Body>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  show: state.user.showOpenIDLoginModal || false,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClose: () => {
    dispatch(closeOpenIDLoginModal());
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(OpenIDLoginModal);
