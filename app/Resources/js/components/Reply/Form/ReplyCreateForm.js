import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ReplyForm from './ReplyForm';
import SubmitButton from '../../Form/SubmitButton';
import LoginStore from '../../../stores/LoginStore';
import { Alert } from 'react-bootstrap';
import ReplyActions from '../../../actions/ReplyActions';

const ReplyCreateForm = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    userReplies: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({
      isSubmitting: true,
    });
  },

  handleSubmitSuccess() {
    this.setState({
      isSubmitting: false,
    });
    if (this.props.form.multipleRepliesAllowed) {
      this.replyForm.emptyForm();
    }
    ReplyActions.loadUserReplies(this.props.form.id);
  },

  handleFailure() {
    this.setState({
      isSubmitting: false,
    });
  },

  render() {
    const { form } = this.props;
    if (!form.contribuable) {
      return null;
    }
    if (!LoginStore.isLoggedIn()) {
      return (
        <Alert bsStyle="warning">
            <strong>{this.getIntlMessage('reply.not_logged_in.error')}</strong>
        </Alert>
      );
    }
    if (this.props.userReplies.length > 0 && !form.multipleRepliesAllowed) {
      return (
        <Alert bsStyle="warning">
            <strong>{this.getIntlMessage('reply.user_has_reply.reason')}</strong>
            <p>{this.getIntlMessage('reply.user_has_reply.error')}</p>
        </Alert>
      );
    }
    return (
      <div id="create-reply-form">
        <ReplyForm
          ref={c => this.replyForm = c}
          form={form}
          isSubmitting={this.state.isSubmitting}
          onSubmitSuccess={this.handleSubmitSuccess}
          onSubmitFailure={this.handleFailure}
          onValidationFailure={this.handleFailure}
        />
        <SubmitButton
          id="submit-create-reply"
          isSubmitting={this.state.isSubmitting}
          onSubmit={this.handleSubmit}
        />
    </div>
    );
  },
});

export default ReplyCreateForm;
