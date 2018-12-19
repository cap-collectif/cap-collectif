// @flow
import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import type { Dispatch, State } from '../../types';
import CloseButton from '../Form/CloseButton';
import ConfirmPasswordForm from './ConfirmPasswordForm';
import { closeConfirmPasswordModal } from '../../redux/modules/user';

type Props = {
  show: boolean,
  dispatch: Dispatch,
};

export class ConfirmPasswordModal extends Component<Props> {
  render() {
    const { show, dispatch } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => dispatch(closeConfirmPasswordModal())}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="confirm_password.title" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {<FormattedMessage id="confirm_password.help" />}
          <ConfirmPasswordForm />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={() => dispatch(closeConfirmPasswordModal())} />
          <Button
            id="confirm-password-form-submit"
            type="submit"
            onClick={() => {
              dispatch(submit('password'));
            }}
            bsStyle="primary">
            {<FormattedMessage id="global.confirm" />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  show: state.user.showConfirmPasswordModal,
  isSubmitting: state.user.isSubmittingAccountForm,
});

export default connect(mapStateToProps)(ConfirmPasswordModal);
