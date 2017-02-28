import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { SubmissionError, change } from 'redux-form';
import UserActions from '../../../actions/UserActions';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import Form from '../../Form/Form';
import { isEmail } from '../../../services/Validator';
import type { State } from '../../../types';
import { login } from '../../../redux/modules/user';

export const validate = (values, props) => {
  const errors = {};
  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'registration.constraints.email.invalid';
  }
  if (!values.plainPassword || values.plainPassword.length < 8) {
    errors.plainPassword = 'registration.constraints.password.min';
  }
  if (values.plainPassword && values.plainPassword.length > 72) {
    errors.plainPassword = 'registration.constraints.password.max';
  }
  if (!values.charte) {
    errors.charte = 'registration.constraints.charte.check';
  }
  if (!values.captcha && (window && window.location.host !== 'capco.test')) {
    errors.captcha = 'registration.constraints.captcha.invalid';
  }
  for (const field of props.dynamicFields) {
    if (field.required && !values[`dynamic-${field.id}`]) {
      errors[`dynamic-${field.id}`] = 'global.required';
    }
  }
  return errors;
};

export const RegistrationForm = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
    userTypes: PropTypes.array.isRequired,
    parameters: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFail: PropTypes.func.isRequired,
    dynamicFields: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(values) {
    const form = Object.assign({}, values);
    delete form.charte;
    const apiForm = {};
    const responses = [];
    Object.keys(form).map((key) => {
      if (key.startWith('dynamic-')) {
        const question = key.split('-')[1];
        if (typeof form[key] !== 'undefined' && form[key].length > 0) {
          responses.push({
            question,
            value: form[key],
          });
        }
      }
    });
    if (responses.length) {
      apiForm.responses = responses;
    }
    return new Promise((resolve, reject) => {
      UserActions
      .register(apiForm)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: { bsStyle: 'success', content: 'alert.success.add.user' },
        });
        login({ username: values.email, password: values.plainPassword }, this.props.dispatch);
        resolve();
      })
      .catch((error) => {
        const response = error.response;
        const errors = { _error: 'Registration failed !' };
        if (response.errors) {
          if (response.errors.children.email.errors && response.errors.children.email.errors.length > 0) {
            response.errors.children.email.errors.map((string) => {
              if (string === 'already_used_email') {
                errors.email = 'registration.constraints.email.already_used';
              } else {
                errors.email = `registration.constraints.${string}`;
              }
            });
          }
          if (response.errors.children.captcha.errors && response.errors.children.captcha.errors.length > 0) {
            errors.captcha = 'registration.constraints.captcha.invalid';
          }
          reject(new SubmissionError(errors));
        }
      });
    });
  },

  handleSubmitFail() {
    const { dispatch, onSubmitFail } = this.props;
    window.grecaptcha.reset();
    onSubmitFail();
    dispatch(change('registration-form', 'captcha', null));
  },

  render() {
    const { dynamicFields, features, userTypes, parameters, onSubmitSuccess } = this.props;
    const cguName = parameters['signin.cgu.name'];
    const cguLink = parameters['signin.cgu.link'];
    const dynamicsField = [];
    if (features.user_type) {
      dynamicsField.push({
        id: 'user_type',
        name: 'userType',
        type: 'select',
        inputClassName: 'null',
        label: (
          <span>
            {this.getIntlMessage('registration.type')} <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
          </span>
        ),
        labelClassName: 'h5',
        placeholder: this.getIntlMessage('registration.select.type'),
        options: userTypes.map((type) => { return { value: type.id, label: type.name }; }),
        meta: { active: true },
      });
    }
    if (features.zipcode_at_register) {
      dynamicsField.push({
        id: 'zipcode',
        name: 'zipcode',
        type: 'text',
        label: (
          <span>
            {this.getIntlMessage('registration.zipcode')} <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
          </span>
        ),
        labelClassName: 'h5',
        autoComplete: 'postal-code',
      });
    }
    dynamicFields.forEach((field) => {
      dynamicsField.push({
        id: field.id,
        name: `dynamic-${field.id}`,
        type: field.type,
        label: (
          <span>
            {field.question} {
              !field.required && <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
            }
          </span>
        ),
        labelClassName: 'h5',
      });
    });
    return (
      <Form
        form="registration-form"
        validate={validate}
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={this.handleSubmitFail}
        onSubmitSuccess={onSubmitSuccess}
        dynamicFields={dynamicFields}
        fields={[
          {
            name: 'username',
            label: this.getIntlMessage('registration.username'),
            labelClassName: 'h5',
            type: 'text',
            id: 'username',
            autoComplete: 'username',
          },
          {
            name: 'email',
            label: this.getIntlMessage('global.email'),
            labelClassName: 'h5',
            type: 'email',
            id: 'email',
            popover: {
              id: 'registration-email-tooltip',
              message: this.getIntlMessage('registration.tooltip.email'),
            },
            autoComplete: 'email',
          },
          {
            name: 'plainPassword',
            label: this.getIntlMessage('registration.password'),
            labelClassName: 'h5',
            type: 'password',
            id: 'password',
            popover: {
              id: 'registration-password-tooltip',
              message: this.getIntlMessage('registration.tooltip.password'),
            },
            autoComplete: 'new-password',
          },
        ]
          .concat(dynamicsField)
          .concat([
            {
              id: 'charte',
              name: 'charte',
              type: 'checkbox',
              label: (
                <FormattedHTMLMessage
                  message={this.getIntlMessage('registration.charte')}
                  link={<a className="external-link" href={cguLink}>{cguName}</a>}
                />
              ),
              labelClassName: 'h5',
            },
            {
              id: 'captcha',
              name: 'captcha',
              type: 'captcha',
            },
          ])
        }
      />
    );
  },

});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  userTypes: state.default.userTypes,
  parameters: state.default.parameters,
  dynamicFields: state.user.registration_form_fields,
});

export default connect(mapStateToProps, null, null, { withRef: true })(RegistrationForm);
