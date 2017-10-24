import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { reduxForm, formValueSelector, Field } from 'redux-form';
import { vote } from '../../../redux/modules/proposal';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';

const form = 'proposalVote';
const validate = (values, { anonymous }) => {
  const errors = {};
  if (anonymous) {
    if (!values.username) {
      errors.username = 'global.required';
    } else if (values.username.length < 2) {
      errors.username = 'proposal.vote.constraints.username';
    }
    if (!values.email) {
      errors.email = 'global.required';
    } else if (!isEmail(values.email)) {
      errors.email = 'proposal.vote.constraints.email';
    }
  }
  return errors;
};

const ProposalVoteForm = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isPrivate: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
    comment: PropTypes.string.isRequired,
    error: PropTypes.string,
    voteWithoutAccount: PropTypes.bool.isRequired,
  },

  render() {
    const { error, handleSubmit, comment, isPrivate, anonymous, voteWithoutAccount } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert bsStyle="danger" id="proposal-vote-form-alertbox">
            <p>{error}</p>
          </Alert>
        )}
        {anonymous &&
          voteWithoutAccount && (
            <Field
              type="text"
              component={renderComponent}
              name="username"
              id="proposal-vote__username"
              label={<FormattedMessage id="proposal.vote.form.username" />}
            />
          )}
        {anonymous &&
          voteWithoutAccount && (
            <Field
              type="email"
              component={renderComponent}
              name="email"
              id="proposal-vote__email"
              label={<FormattedMessage id="proposal.vote.form.email" />}
            />
          )}
        {comment.length > 0 && (voteWithoutAccount || !anonymous) ? null : (
          <Field
            type="checkbox"
            component={renderComponent}
            name="private"
            id="proposal-vote__private"
            disableValidation
            children={<FormattedMessage id="proposal.vote.form.private" />}
          />
        )}
        {!isPrivate &&
          (!voteWithoutAccount || anonymous) && (
            <Field
              type="textarea"
              component={renderComponent}
              name="comment"
              id="proposal-vote__comment"
              label={
                <span style={{ fontWeight: 'normal' }}>
                  {<FormattedMessage id="proposal.vote.form.comment" />}
                  <span className="excerpt">{<FormattedMessage id="global.form.optional" />}</span>
                </span>
              }
              placeholder="proposal.vote.form.comment_placeholder"
            />
          )}
      </form>
    );
  },
});

const mapStateToProps = state => ({
  comment: formValueSelector(form)(state, 'comment') || '',
  isPrivate: formValueSelector(form)(state, 'private') || false,
  anonymous: state.user.user === null,
  voteWithoutAccount: state.default.features.vote_without_account,
});

export default connect(mapStateToProps)(
  reduxForm({
    form,
    validate,
    onSubmit: (values, dispatch, { proposal, step }) => vote(dispatch, step, proposal, values),
  })(ProposalVoteForm),
);
