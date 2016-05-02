import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ReplyCreateForm from './ReplyCreateForm';
<<<<<<< HEAD
import { Alert } from 'react-bootstrap';
import LoginButton from '../../User/Login/LoginButton';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import LoginButton from '../../User/Login/LoginButton';
import PhoneModal from '../../User/Phone/PhoneModal';

export const ReplyCreateFormWrapper = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    userReplies: PropTypes.array.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      showPhoneModal: false,
    };
  },

  openPhoneModal() {
    this.setState({ showPhoneModal: true });
  },


  closePhoneModal() {
    this.setState({ showPhoneModal: false });
  },

  formIsDisabled() {
    const { form, userReplies } = this.props;
    return (
      !form.contribuable
      || !this.props.user
      || (form.smsConfirmationRequired && !user.isSmsConfirmed)
      || (userReplies.length > 0 && !form.multipleRepliesAllowed)
    );
  },

  render() {
    const { form } = this.props;
    return (
      <div>
        {
          form.contribuable && !this.props.user
          ? <Alert bsStyle="warning">
            <strong>{this.getIntlMessage('reply.not_logged_in.error')}</strong>
            <span style={{ marginLeft: '10px' }}><LoginButton bsStyle="primary" /></span>
          </Alert>
          : form.contribuable && this.props.userReplies.length > 0 && !form.multipleRepliesAllowed
            ? <Alert bsStyle="warning">
              <strong>{this.getIntlMessage('reply.user_has_reply.reason')}</strong>
              <p>{this.getIntlMessage('reply.user_has_reply.error')}</p>
            </Alert>
            : null
        }
        {
          form.contribuable && LoginStore.isLoggedIn() && !LoginStore.user.isSmsConfirmed &&
          <Alert bsStyle="warning">
            <strong>{ this.getIntlMessage('phone.please_verify') }</strong>
            <span style={{ marginLeft: '10px' }}>
              <Button onClick={this.openPhoneModal}>{ this.getIntlMessage('phone.check')}</Button>
            </span>
          </Alert>
        }
        <ReplyCreateForm form={form} disabled={this.formIsDisabled()} />
        <PhoneModal
          show={this.state.showPhoneModal}
          onClose={this.closePhoneModal}
        />
      </div>
    );
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ReplyCreateFormWrapper);
