// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { Button } from 'react-bootstrap';
import type { Dispatch } from '../../../types';
import renderComponent from '../../Form/Field';
import UserActions from '../../../actions/UserActions';

type Props = {
  onSubmitSuccess: () => void,
  submitting: boolean,
  handleSubmit: () => void,
};

const onSubmit = (values: { code: string }, dispatch: Dispatch, props: Props) => {
  const { onSubmitSuccess } = props;

  return UserActions.sendSmsCode(values)
    .then(() => {
      onSubmitSuccess();
    })
    .catch(error => {
      if (error && error.response && error.response.message === 'sms_code_invalid') {
        throw new SubmissionError({ code: 'phone.confirm.code_invalid' });
      }
    });
};

const validate = ({ code }: Object) => {
  const errors = {};

  if (!code || code.length !== 6) {
    errors.code = 'phone.confirm.constraints.code';
  }

  return errors;
};

export const formName = 'SmsCodeForm';

export class SmsCodeForm extends React.Component<Props> {
  render() {
    const { submitting, handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit} className="phone__confirm-code__form">
        <Field
          type="text"
          name="code"
          autoFocus
          label={<FormattedMessage id="phone.confirm.code" />}
          id="_code"
          component={renderComponent}
        />
        <div className="phone__confirm-code__btn">
          <Button
            type="submit"
            bsStyle="primary"
            style={{ padding: '6px 12px 7px' }}
            disabled={submitting}>
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="phone.confirm.validate" />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

export default reduxForm({
  validate,
  onSubmit,
  form: formName,
})(SmsCodeForm);
