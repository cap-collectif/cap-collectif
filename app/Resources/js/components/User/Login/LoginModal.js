import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import LoginForm from './LoginForm';
import { LoginSocialButtons } from './LoginSocialButtons';
import FeatureStore from '../../../stores/FeatureStore';

const LoginModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
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

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show } = this.props;
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
            {this.getIntlMessage('global.login')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginSocialButtons features={{
            login_facebook: FeatureStore.isActive('login_facebook'),
            login_gplus: FeatureStore.isActive('login_gplus'),
          }} />
          <LoginForm
            isSubmitting={this.state.isSubmitting}
            onSubmitFailure={this.stopSubmit}
            onSubmitSuccess={onClose}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-login"
            label="global.login_me"
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default LoginModal;
