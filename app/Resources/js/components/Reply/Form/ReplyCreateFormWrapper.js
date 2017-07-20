import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import ReplyCreateForm from './ReplyCreateForm';
import LoginButton from '../../User/Login/LoginButton';
import RegistrationButton from '../../User/Registration/RegistrationButton';
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
    const { form, userReplies, user } = this.props;
    return (
      !form.contribuable
      || !user
      || (form.phoneConfirmationRequired && !user.isPhoneConfirmed)
      || (userReplies.length > 0 && !form.multipleRepliesAllowed)
    );
  },

  render() {
    const {
      form,
      user,
      userReplies,
    } = this.props;
    return (
      <div>
        {
          form.contribuable && !user
          ? <Alert bsStyle="warning" className="text-center">
            <strong>{this.getIntlMessage('reply.not_logged_in.error')}</strong>
            <RegistrationButton bsStyle="primary" style={{ marginLeft: '10px' }} />
            <LoginButton style={{ marginLeft: 5 }} />
          </Alert>
          : form.contribuable && userReplies.length > 0 && !form.multipleRepliesAllowed
            ? <Alert bsStyle="warning">
              <strong>{this.getIntlMessage('reply.user_has_reply.reason')}</strong>
              <p>{this.getIntlMessage('reply.user_has_reply.error')}</p>
            </Alert>
            : null
        }
        {
          form.contribuable && form.phoneConfirmationRequired && user && !user.isPhoneConfirmed &&
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
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ReplyCreateFormWrapper);
