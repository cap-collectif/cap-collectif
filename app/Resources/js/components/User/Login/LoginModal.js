import React, { PropTypes } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import LoginForm from './LoginForm';
import { LoginSocialButtons } from './LoginSocialButtons';
import { connect } from 'react-redux';

export const LoginModal = React.createClass({
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

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ isSubmitting: true });
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show, parameters } = this.props;
    const textTop = parameters['login.text.top'];
    const textBottom = parameters['login.text.bottom'];
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
            {
              textTop &&
              <Alert bsStyle="info" className="text-center">
                <FormattedHTMLMessage message={textTop} />
              </Alert>
            }
            <LoginSocialButtons features={{
              login_facebook: this.props.features.login_facebook,
              login_gplus: this.props.features.login_gplus,
            }} />
            <LoginForm
              isSubmitting={this.state.isSubmitting}
              onSubmitFailure={this.stopSubmit}
              onSubmitSuccess={onClose}
            />
            {
              textBottom &&
              <div className="text-center small excerpt" style={{ marginTop: '15px' }}>
                <FormattedHTMLMessage message={textBottom} />
              </div>
            }
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

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    parameters: state.default.parameters,
  };
};

export default connect(mapStateToProps)(LoginModal);
