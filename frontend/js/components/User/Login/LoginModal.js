// @flow
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting, change } from 'redux-form';
import CloseButton from '../../Form/CloseButton';
import LoginBox from './LoginBox';
import { closeLoginModal } from '../../../redux/modules/user';
import type { Dispatch, State } from '../../../types';
import { formName } from './LoginForm';

type Props = {|
  +submitting: boolean,
  +show: boolean,
  +onClose: () => void,
  +onSubmit: () => void,
|};

export class LoginModal extends React.Component<Props> {
  render() {
    const { submitting, show, onClose, onSubmit } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        autoFocus
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <form id="login-form" onSubmit={onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg" componentClass="h1">
              {<FormattedMessage id="global.login" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <LoginBox />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            <Button id="confirm-login" type="submit" disabled={submitting} bsStyle="primary">
              {submitting ? (
                <FormattedMessage id="global.loading" />
              ) : (
                <FormattedMessage id="global.login_me" />
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State) => ({
  submitting: isSubmitting('login')(state),
  show: state.user.showLoginModal || false,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (e: Event) => {
    e.preventDefault();
    dispatch(submit('login'));
  },
  onClose: () => {
    dispatch(change(formName, 'username', null));
    dispatch(change(formName, 'password', null));
    dispatch(change(formName, 'captcha', null));
    dispatch(closeLoginModal());
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(LoginModal);
