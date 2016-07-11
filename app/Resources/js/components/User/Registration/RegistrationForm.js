import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { SubmissionError, change } from 'redux-form';
import UserActions from '../../../actions/UserActions';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import Form from '../../Form/Form';

export const validate = values => {
  const errors = {};
  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'registration.constraints.email.invalid';
  }
  if (!values.plainPassword || values.plainPassword.length < 8) {
    errors.plainPassword = 'registration.constraints.password.min';
  }
  if (!values.charte) {
    errors.charte = 'registration.constraints.charte.check';
  }
  if (!values.captcha) {
    errors.captcha = 'global.constraints.notBlank';
  }
  return errors;
};


export const RegistrationForm = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
    user_types: PropTypes.array.isRequired,
    parameters: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFail: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(values) {
    const form = Object.assign({}, values);
    delete form.charte;
    return new Promise((resolve, reject) => {
      UserActions
      .register(form)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: { bsStyle: 'success', content: 'alert.success.add.user' },
        });
        UserActions.login({ _username: values.email, _password: values.plainPassword });
        resolve();
      })
      .catch((error) => {
        const response = error.response;
        const errors = { _error: 'Registration failed !' };
        if (response.errors) {
          if (response.errors.children.email.errors && response.errors.children.email.errors.length > 0) {
            response.errors.children.email.errors.map(string => {
              if (string === 'already_used_email') {
                errors.email = 'registration.constraints.email.already_used';
              } else {
                errors.email = 'registration.constraints.' + string;
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
    const { features, user_types, parameters, onSubmitSuccess } = this.props;
    const cguName = parameters['signin.cgu.name'];
    const cguLink = parameters['signin.cgu.link'];
    const dynamicsField = [];
    if (features.user_type) {
      dynamicsField.push({
        id: '_user_type',
        name: 'userType',
        type: 'select',
        label: (
          <span>
            {this.getIntlMessage('registration.type')} <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
          </span>
        ),
        labelClassName: 'h5',
        defaultOptionLabel: this.getIntlMessage('registration.select.type'),
        options: user_types.map((type) => { return { value: type.id, label: type.name }; }),
      });
    }
    if (features.zipcode_at_register) {
      dynamicsField.push({
        id: '_zipcode',
        name: 'zipcode',
        type: 'text',
        label: (
          <span>
            {this.getIntlMessage('registration.zipcode')} <span className="excerpt">{this.getIntlMessage('global.form.optional')}</span>
          </span>
        ),
        labelClassName: 'h5',
      });
    }
    return (
      <Form
        form="registration-form"
        validate={validate}
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={this.handleSubmitFail}
        onSubmitSuccess={onSubmitSuccess}
        fields={[
          {
            name: 'username',
            label: this.getIntlMessage('registration.username'),
            labelClassName: 'h5',
            type: 'text',
            id: '_username',
          },
          {
            name: 'email',
            label: this.getIntlMessage('global.email'),
            labelClassName: 'h5',
            type: 'email',
            id: '_email',
            popover: {
              id: 'registration-email-tooltip',
              message: this.getIntlMessage('registration.tooltip.email'),
            },
          },
          {
            name: 'plainPassword',
            label: this.getIntlMessage('registration.password'),
            labelClassName: 'h5',
            type: 'password',
            id: '_password',
            popover: {
              id: 'registration-password-tooltip',
              message: this.getIntlMessage('registration.tooltip.password'),
            },
          },
        ]
        .concat(dynamicsField)
        .concat([
          {
            id: '_charte',
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
            id: '_captcha',
            name: 'captcha',
            type: 'captcha',
          },
        ])
        }
      />
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user_types: state.default.user_types,
    parameters: state.default.parameters,
  };
};

export default connect(mapStateToProps, null, null, { withRef: true })(RegistrationForm);
