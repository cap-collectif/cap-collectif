// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
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
            {
              <FormattedMessage
                id="continue-as-sso-connected-user"
                values={{ SSOConnectedUserName: 'Moi' }}
              />
            }
            <a href="/">
              <FormattedMessage id="change-user" />
            </a>
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
