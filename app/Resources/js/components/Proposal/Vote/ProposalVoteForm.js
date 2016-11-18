import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
// import FlashMessages from '../../Utils/FlashMessages';
import renderComponent from '../../Form/Field';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, Field } from 'redux-form';
import { vote } from '../../../redux/modules/proposal';
import { Alert } from 'react-bootstrap';

const form = 'proposalVote';
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
    anonymous: PropTypes.bool.isRequired,
    comment: PropTypes.string.isRequired,
    error: PropTypes.string,
  },
  mixins: [IntlMixin],

  render() {
    const { error, handleSubmit, comment, isPrivate, anonymous } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {
          error &&
            <Alert bsStyle="danger">
              <p>{error}</p>
            </Alert>
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
          !isPrivate &&
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
          comment.length > 0
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

const mapStateToProps = state => ({
  comment: formValueSelector(form)(state, 'comment') || '',
  isPrivate: formValueSelector(form)(state, 'private'),
  anonymous: state.default.user === null,
});

export default connect(mapStateToProps)(reduxForm({
  form,
  onSubmit: (values, dispatch, { proposal, step }) => (vote(dispatch, step, proposal, values)),
})(ProposalVoteForm));
