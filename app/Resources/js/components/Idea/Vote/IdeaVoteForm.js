import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import renderComponent from '../../Form/Field';
import { isEmail } from '../../../services/Validator';
import type { State } from '../../../types';

const validate = ({ username, email }: Object, props) => {
  const errors = {};
  const { anonymous } = props;
  if (anonymous) {
    if (!username || username.length <= 2) {
      errors.username = 'idea.vote.constraints.username';
    }
    if (!email || !isEmail(email)) {
      errors.email = 'idea.vote.constraints.email';
    }
  }

  return errors;
};

export const formName = 'IdeaVoteForm';

const IdeaVoteForm = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
    anonymous: PropTypes.bool.isRequired,
    hasCommentValue: PropTypes.bool.isRequired,
    isPrivate: PropTypes.bool.isRequired,
  },

  userHasVote() {
    const { anonymous, idea } = this.props;
    return !anonymous && idea.userHasVote;
  },

  render() {
    const { anonymous, idea, hasCommentValue, isPrivate } = this.props;

    return (
      <form>
        {anonymous && (
          <Field
            id="idea-vote-username"
            type="text"
            name="username"
            component={renderComponent}
            label={<FormattedMessage id="idea.vote.form.username" />}
          />
        )}

        {anonymous ? (
          <Field
            id="idea-vote-email"
            type="email"
            name="email"
            component={renderComponent}
            label={<FormattedMessage id="idea.vote.form.email" />}
          />
        ) : null}

        {idea.commentable &&
        !isPrivate &&
        (anonymous || !this.userHasVote()) && (
          <Field
            id="idea-vote-comment"
            type="textarea"
            name="comment"
            component={renderComponent}
            label={<FormattedMessage id="idea.vote.form.comment" />}
            placeholder="idea.vote.form.comment_placeholder"
          />
        )}

        {(hasCommentValue && hasCommentValue.length > 0) ||
        (!anonymous && this.userHasVote()) ? null : (
          <Field
            id="idea-vote-private"
            type="checkbox"
            name="private"
            component={renderComponent}
            children={<FormattedMessage id="idea.vote.form.private" />}
          />
        )}
      </form>
    );
  },
});

const mapStateToProps = (state: State) => ({
  hasCommentValue: formValueSelector(formName)(state, 'comment'),
  isPrivate: formValueSelector(formName)(state, 'private'),
});

export default connect(mapStateToProps)(
  reduxForm({
    validate,
    form: formName,
  })(IdeaVoteForm),
);
