// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { reduxForm, formValueSelector, Field } from 'redux-form';
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
  isPrivate: boolean,
  anonymous: boolean,
  error: string,
  voteWithoutAccount: boolean,
};

class ProposalVoteForm extends React.Component<Props> {
  render() {
    const { error, handleSubmit, anonymous, voteWithoutAccount } = this.props;
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
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
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
