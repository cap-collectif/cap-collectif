import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
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

  handleSubmit(e) {
    e.preventDefault();
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
        <form id="login-form" onSubmit={this.handleSubmit}>
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
            <Button
              id="confirm-login"
              type="submit"
              disabled={isSubmitting}
              bsStyle="primary"
            >
              {isSubmitting
                ? this.getIntlMessage('global.loading')
                : this.getIntlMessage('global.login_me')
              }
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  },

});

export default LoginModal;
