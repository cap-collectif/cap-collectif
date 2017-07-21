import React, { PropTypes } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import RegistrationForm, { form } from './RegistrationForm';
import LoginSocialButtons from '../Login/LoginSocialButtons';
import { closeRegistrationModal } from '../../../redux/modules/user';
import type { State, Dispatch } from '../../../types';

export const RegistrationModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    textTop: PropTypes.string,
    textBottom: PropTypes.string,
    submitting: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
  },

  render() {
    const {
      submitting,
      onSubmit,
      onClose,
      show,
      textTop,
      textBottom,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        autoFocus
        onHide={onClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
        enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="global.register" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {textTop &&
            <Alert bsStyle="info" className="text-center">
              <div dangerouslySetInnerHTML={{ __html: textTop }} />
            </Alert>}
          <LoginSocialButtons prefix="registration." />
          <RegistrationForm
            ref={c => (this.form = c)}
            onSubmitFail={this.stopSubmit}
            onSubmitSuccess={this.handleSubmitSuccess}
          />
          {textBottom &&
            <div
              className="text-center small excerpt"
              style={{ marginTop: '15px' }}
              dangerouslySetInnerHTML={{ __html: textBottom }}
            />}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-register"
            label="global.register"
            isSubmitting={submitting}
            onSubmit={onSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },
});

const mapStateToProps = (state: State) => ({
  textTop:
    state.user.registration_form.topTextDisplayed &&
    state.user.registration_form.topText,
  textBottom:
    state.user.registration_form.bottomTextDisplayed &&
    state.user.registration_form.bottomText,
  show: state.user.showRegistrationModal,
  submitting: isSubmitting(form)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClose: () => {
    dispatch(closeRegistrationModal());
  },
  onSubmit: () => {
    dispatch(submit(form));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationModal);
