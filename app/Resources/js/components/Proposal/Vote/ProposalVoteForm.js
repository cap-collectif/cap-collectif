// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
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

type Props = {
  proposal: Object,
  step: Object,
  handleSubmit: () => void,
  error: string,
};

class ProposalVoteForm extends React.Component<Props> {
  render() {
    const { error, handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert bsStyle="danger" id="proposal-vote-form-alertbox">
            <p>{error}</p>
          </Alert>
        )}
        <Field
          type="checkbox"
          component={renderComponent}
          name="private"
          id="proposal-vote__private"
          disableValidation
          children={<FormattedMessage id="proposal.vote.form.private" />}
        />
      </form>
    );
  }
}

export default reduxForm({
  form,
  validate,
  onSubmit: (values, dispatch, { proposal, step }) => vote(dispatch, step, proposal, values),
})(ProposalVoteForm);
