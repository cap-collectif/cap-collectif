import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';

const IdeaVoteForm = React.createClass({
  displayName: 'IdeaVoteForm',

  propTypes: {
    idea: PropTypes.object.isRequired,
    serverErrors: PropTypes.array,
    anonymous: PropTypes.bool.isRequired,
  },

  mixins: [DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      serverErrors: [],
    };
  },

  getInitialState() {
    return {
      form: {
        username: '',
        email: '',
        comment: '',
        private: false,
      },
      errors: {
        username: [],
        email: [],
        comment: [],
        private: [],
      },
    };
  },

  componentDidMount() {
    const { anonymous } = this.props;
    this.updateAnonymousConstraints(anonymous);
  },

  componentWillReceiveProps(nextProps) {
    const { anonymous } = this.props;
    if (nextProps.anonymous !== anonymous) {
      this.updateAnonymousConstraints(nextProps.anonymous);
    }
  },

  updateAnonymousConstraints(anonymous) {
    this.formValidationRules = {};
    if (anonymous) {
      this.formValidationRules = {
        username: {
          min: { value: 2, message: 'idea.vote.constraints.username' },
          notBlank: { message: 'idea.vote.constraints.username' },
        },
        email: {
          notBlank: { message: 'idea.vote.constraints.email' },
          isEmail: { message: 'idea.vote.constraints.email' },
        },
      };
    }
  },

  formValidationRules: {},

  userHasVote() {
    const { anonymous, idea } = this.props;
    return !anonymous && idea.userHasVote;
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    const { anonymous, serverErrors, idea } = this.props;
    const { form } = this.state;

    return (
      <form ref={c => (this.form = c)}>
        <FlashMessages errors={serverErrors} translate={false} />

        {anonymous &&
          <Input
            id="idea-vote-username"
            type="text"
            name="idea-vote__username"
            valueLink={this.linkState('form.username')}
            label={`${<FormattedMessage id="idea.vote.form.username" />} *`}
            groupClassName={this.getGroupStyle('username')}
            errors={this.renderFormErrors('username')}
          />}

        {anonymous
          ? <Input
              id="idea-vote-email"
              type="text"
              name="idea-vote__email"
              valueLink={this.linkState('form.email')}
              label={`${<FormattedMessage id="idea.vote.form.email" />} *`}
              groupClassName={this.getGroupStyle('email')}
              errors={this.renderFormErrors('email')}
            />
          : null}

        {idea.commentable &&
          !form.private &&
          (anonymous || !this.userHasVote()) &&
          <Input
            id="idea-vote-comment"
            type="textarea"
            name="idea-vote__comment"
            valueLink={this.linkState('form.comment')}
            label={<FormattedMessage id="idea.vote.form.comment" />}
            placeholder="idea.vote.form.comment_placeholder"
            groupClassName={this.getGroupStyle('comment')}
            errors={this.renderFormErrors('comment')}
          />}

        {(form.comment && form.comment.length > 0) ||
        (!anonymous && this.userHasVote())
          ? null
          : <Input
              id="idea-vote-private"
              type="checkbox"
              name="idea-vote__private"
              checkedLink={this.linkState('form.private')}
              children={<FormattedMessage id="idea.vote.form.private" />}
              groupClassName={this.getGroupStyle('private')}
              errors={this.renderFormErrors('private')}
            />}
      </form>
    );
  },
});

export default IdeaVoteForm;
