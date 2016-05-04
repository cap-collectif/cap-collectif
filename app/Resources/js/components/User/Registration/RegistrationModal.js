import React, { PropTypes } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import RegistrationForm from './RegistrationForm';
import { LoginSocialButtons } from '../Login/LoginSocialButtons';
import { connect } from 'react-redux';

export const RegistrationModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
    parameters: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  handleSubmitSuccess() {
    this.stopSubmit();
    this.props.onClose();
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show, parameters } = this.props;
    const textTop = parameters['signin.text.top'];
    const textBottom = parameters['signin.text.bottom'];
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('global.register')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            textTop &&
            <Alert bsStyle="info" className="text-center">
              {textTop}
            </Alert>
          }
          <LoginSocialButtons
            features={{
              login_facebook: this.props.features.login_facebook,
              login_gplus: this.props.features.login_gplus,
            }}
            prefix="registration."
          />
          <RegistrationForm
            isSubmitting={isSubmitting}
            onSubmitFailure={this.stopSubmit}
            onValidationFailure={this.stopSubmit}
            onSubmitSuccess={this.handleSubmitSuccess}
          />
          {
            textBottom &&
            <div className="text-center small excerpt" style={{ marginTop: '15px' }}>
              {textBottom}
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-register"
            label="global.register"
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.features,
    parameters: state.parameters,
  };
};

export default connect(mapStateToProps)(RegistrationModal);
