import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
// import FlashMessages from '../../Utils/FlashMessages';
import renderComponent from '../../Form/Field';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { vote } from '../../../redux/modules/proposal';

// const validate = (values, props) => {
//   if (!user) {
//     this.formValidationRules = {
//       username: {
//         min: { value: 2, message: 'proposal.vote.constraints.username' },
//         notBlank: { message: 'proposal.vote.constraints.username' },
//       },
//       email: {
//         notBlank: { message: 'proposal.vote.constraints.email' },
//         isEmail: { message: 'proposal.vote.constraints.email' },
//       },
//     };
//   }
// };

const ProposalVoteForm = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isPrivate: PropTypes.bool.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
    comment: PropTypes.string.isRequired,
    error: PropTypes.string,
  },
  mixins: [IntlMixin],

  render() {
    const { error, handleSubmit, comment, isPrivate, anonymous, proposal: { userHasVote } } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {
          error && <strong>{error}</strong>
        }
        {
          anonymous &&
            <Field
              type="text"
              component={renderComponent}
              name="username"
              id="proposal-vote__username"
              label={this.getIntlMessage('proposal.vote.form.username')}
            />
        }
        {
          anonymous &&
            <Field
              type="email"
              component={renderComponent}
              name="email"
              id="proposal-vote__email"
              label={this.getIntlMessage('proposal.vote.form.email')}
            />
        }
        {
          (!isPrivate && (anonymous || !userHasVote)) &&
            <Field
              type="textarea"
              component={renderComponent}
              name="comment"
              id="proposal-vote__comment"
              label={
                <span>
                  {this.getIntlMessage('proposal.vote.form.comment')}
                  <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
                </span>
              }
              placeholder={this.getIntlMessage('proposal.vote.form.comment_placeholder')}
            />
        }
        {
          comment.length > 0 || (!anonymous && userHasVote)
          ? null
            : <Field
              type="checkbox"
              component={renderComponent}
              name="private"
              id="proposal-vote__private"
              label={this.getIntlMessage('proposal.vote.form.private')}
              />
        }
      </form>
    );
  },

});

const mapStateToProps = (state, props) => {
  return {
    comment: '',
    private: false,
    anonymous: state.default.user === null,
    userHasVote: props.step !== null && state.proposal.userVotesByStepId[props.step.id].includes(props.proposal.id),
  };
};

export default connect(mapStateToProps)(reduxForm({
  form: 'proposalVote',
  onSubmit: (values, dispatch, { proposal, step }) => { console.log(values); vote(dispatch, step, proposal, values); },
})(ProposalVoteForm));
