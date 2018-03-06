// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import { Alert } from 'react-bootstrap';
import renderInput from '../../Form/Field';
import { login as onSubmit } from '../../../redux/modules/user';

type LoginValues = {
  username: string,
  password: string
};
const formName = 'login';

const initialValues: LoginValues = {
  username: '',
  password: ''
};

export const LoginForm = React.createClass({
  propTypes: {
    error: PropTypes.string
  },

  render() {
    const { error } = this.props;
    return (
      <div>
        {error && (
          <Alert bsStyle="danger">
            <p>
              <FormattedMessage id={error} />
            </p>
          </Alert>
        )}
        <Field
          name="username"
          type="email"
          autoFocus
          disableValidation
          id="username"
          labelClassName="h5"
          label={<FormattedMessage id="global.email" />}
          autoComplete="email"
          component={renderInput}
        />
        <Field
          name="password"
          type="password"
          autoFocus
          disableValidation
          id="password"
          label={<FormattedMessage id="global.password" />}
          labelClassName="w100 h5"
          autoComplete="current-password"
          component={renderInput}
        />
        <a className="small" href="/resetting/request">
          {<FormattedMessage id="global.forgot_password" />}
        </a>
      </div>
    );
  }
});

export default reduxForm({
  initialValues,
  onSubmit,
  form: formName,
  destroyOnUnmount: true
})(LoginForm);
