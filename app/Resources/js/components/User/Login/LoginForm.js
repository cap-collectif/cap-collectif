// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Alert } from 'react-bootstrap';
import renderInput from '../../Form/Field';
import { login as onSubmit } from '../../../redux/modules/user';
import type { State } from '../../../types';
import { isEmail } from '../../../services/Validator';

type LoginValues = {
  username: string,
  password: string,
};

export const validate = (values: Object) => {
  const errors = {};

  if (!values.email || !isEmail(values.email)) {
    errors.email = 'registration.constraints.email.invalid';
  }

  return errors;
};

const formName = 'login';

const initialValues: LoginValues = {
  username: '',
  password: '',
};

type Props = {
  error?: string,
};

export class LoginForm extends React.Component<Props> {
  render() {
    const { error } = this.props;
    return (
      <div className="form_no-bold-label">
        {error && (
          <Alert bsStyle="danger">
            <p>
              <FormattedMessage id={error} />
            </p>
          </Alert>
        )}
        <Field
          name="email"
          type="email"
          autoFocus
          disableValidation
          ariaRequired
          id="email"
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
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  shieldEnabled: state.default.features.shield_mode,
});

const connector = connect(mapStateToProps);
export default connector(
  reduxForm({
    initialValues,
    validate,
    onSubmit,
    form: formName,
    destroyOnUnmount: true,
  })(LoginForm),
);
