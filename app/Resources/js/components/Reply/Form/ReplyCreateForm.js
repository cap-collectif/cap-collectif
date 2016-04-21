import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ReplyForm from './ReplyForm';
import SubmitButton from '../../Form/SubmitButton';
import ReplyActions from '../../../actions/ReplyActions';

const ReplyCreateForm = React.createClass({
  displayName: 'ReplyCreateForm',
  propTypes: {
    form: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
    };
  },

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
    return (
      <div id="create-reply-form">
        <ReplyForm
          ref={c => this.replyForm = c}
          form={form}
          isSubmitting={this.state.isSubmitting}
          onSubmitSuccess={this.handleSubmitSuccess}
          onSubmitFailure={this.handleFailure}
          onValidationFailure={this.handleFailure}
          disabled={this.props.disabled}
        />
        <SubmitButton
          id="submit-create-reply"
          isSubmitting={this.state.isSubmitting}
          onSubmit={this.handleSubmit}
          disabled={this.props.disabled}
        />
    </div>
    );
  },
});

export default ReplyCreateForm;
