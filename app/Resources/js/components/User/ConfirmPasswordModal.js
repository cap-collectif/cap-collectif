import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import CloseButton from '../Form/CloseButton';

export const ConfirmPasswordModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { show, onClose, dispatch } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
        <form id="confirm-password-form" onSubmit={() => dispatch(submit('account'))}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {this.getIntlMessage('confirm_password.title')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.getIntlMessage('confirm_password.help')}
            <ConfirmPasswordForm />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            <Button
              id="confirm-password-form-submit"
              type="submit"
              bsStyle="primary"
            >
              { this.getIntlMessage('global.confirm') }
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    show: state.user.showConfirmPasswordModal,
    isSubmitting: state.user.isSubmittingAccountForm,
  };
};

export default connect(mapStateToProps)(ConfirmPasswordModal);
