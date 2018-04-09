// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
<<<<<<< HEAD
=======
import { connect, type MapStateToProps } from 'react-redux';
>>>>>>> Implement addVote and removeVote mutations
import { Alert } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { vote } from '../../../redux/modules/proposal';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import type { State } from '../../../types';

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

type Props = {
  proposal: Object,
  step: Object,
  handleSubmit: () => void,
<<<<<<< HEAD
  error: string,
=======
  isPrivate: boolean,
  anonymous: boolean,
  error: string,
  voteWithoutAccount: boolean,
>>>>>>> Implement addVote and removeVote mutations
};

class ProposalVoteForm extends React.Component<Props> {
  render() {
<<<<<<< HEAD
    const { error, handleSubmit } = this.props;
=======
    const { error, handleSubmit, anonymous, voteWithoutAccount } = this.props;
>>>>>>> Implement addVote and removeVote mutations
    return (
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert bsStyle="danger" id="proposal-vote-form-alertbox">
            <p>{error}</p>
          </Alert>
        )}
<<<<<<< HEAD
        <Field
          type="checkbox"
          component={renderComponent}
          name="private"
          id="proposal-vote__private"
          disableValidation
          children={<FormattedMessage id="proposal.vote.form.private" />}
        />
=======
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
        {voteWithoutAccount || !anonymous ? null : (
          <Field
            type="checkbox"
            component={renderComponent}
            name="private"
            id="proposal-vote__private"
            disableValidation
            children={<FormattedMessage id="proposal.vote.form.private" />}
          />
        )}
>>>>>>> Implement addVote and removeVote mutations
      </form>
    );
  }
}
<<<<<<< HEAD
=======

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  isPrivate: formValueSelector(form)(state, 'private') || false,
  anonymous: state.user.user === null,
  voteWithoutAccount: state.default.features.vote_without_account,
});
>>>>>>> Implement addVote and removeVote mutations

export default reduxForm({
  form,
  validate,
  onSubmit: (values, dispatch, { proposal, step }) => vote(dispatch, step, proposal, values),
})(ProposalVoteForm);
