import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ReplyCreateForm from './ReplyCreateForm';
import LoginStore from '../../../stores/LoginStore';
import { Alert } from 'react-bootstrap';
import LoginButton from '../../User/Login/LoginButton';

const ReplyCreateFormWrapper = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    userReplies: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  formIsDisabled() {
    const { form, userReplies } = this.props;
    return (
      !form.contribuable
      || !LoginStore.isLoggedIn()
      || (userReplies.length > 0 && !form.multipleRepliesAllowed)
    );
  },

  render() {
    const { form } = this.props;
    return (
      <div>
        {
          form.contribuable && !LoginStore.isLoggedIn()
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
        <ReplyCreateForm form={form} disabled={this.formIsDisabled()} />
      </div>
    );
  },
});

export default ReplyCreateFormWrapper;
