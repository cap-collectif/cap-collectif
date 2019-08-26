// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import { Alert } from 'react-bootstrap';
import renderInput from '../../Form/Field';
import { login as onSubmit } from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';

type LoginValues = {|
  username: string,
  password: string,
|};

type Props = {|
  error?: string,
|};

const formName = 'login';

export const validate = (values: LoginValues) => {
  const errors = {};

  if (!values.username || !isEmail(values.username)) {
    errors.username = 'global.constraints.email.invalid';
  }

  return errors;
};

export class LoginForm extends React.Component<Props> {

  render() {
    const { error } = this.props;
    return (
      <div className="form_no-bold-label">
        {error && (
          <Alert bsStyle="danger">
            <p>
              <div className="font-weight-bold"><FormattedMessage id={error} /></div>
              <FormattedMessage id="try-again-or-click-on-forgotten-password-to-reset-it" />
            </p>
          </Alert>
        )}
        <Field
          name="username"
          type="email"
          autoFocus
          disableValidation
          ariaRequired
          id="username"
          label={<FormattedMessage id="global.email" />}
          autoComplete="email"
          labelClassName="font-weight-normal"
          component={renderInput}
        />
        <Field
          name="password"
          type="password"
          autoFocus
          disableValidation
          ariaRequired
          id="password"
          label={<FormattedMessage id="global.password" />}
          labelClassName="w-100 font-weight-normal"
          autoComplete="current-password"
          component={renderInput}
        />
        <a href="/resetting/request">{<FormattedMessage id="global.forgot_password" />}</a>
        {false ? <Field id="captcha" component={renderInput} name="captcha" type="captcha" /> : null}

      </div>
    );
  }
}

export default reduxForm({
  initialValues: {
    username: '',
    password: '',
  },
  validate,
  onSubmit,
  form: formName,
  destroyOnUnmount: true,
})(LoginForm);
