import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import mailcheck from 'mailcheck';
import ReCAPTCHA from 'react-google-recaptcha';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import UserActions from '../../../actions/UserActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
import domains from './email_domains';

export const RegistrationForm = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    user_types: PropTypes.array.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
    onSubmitFailure: PropTypes.func,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
    };
  },

  getInitialState() {
    return {
      form: {
        username: '',
        email: '',
        plainPassword: '',
        charte: false,
        captcha: '',
        zipcode: '',
        userType: '',
      },
      suggestedEmail: null,
      errors: {
        username: [],
        email: [],
        plainPassword: [],
        charte: [],
        captcha: [],
        zipcode: [],
        userType: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    const { isSubmitting, onSubmitSuccess, onSubmitFailure, onValidationFailure, features } = this.props;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (this.isValid()) {
        const form = JSON.parse(JSON.stringify(this.state.form));
        delete form.charte;
        if (!features.user_type) {
          delete form.userType;
        }
        if (!features.zipcode_at_register) {
          delete form.zipcode;
        }
        return UserActions
          .register(form)
          .then(() => {
            UserActions.login({ _username: form.email, _password: form.plainPassword });
            this.setState(this.getInitialState());
            return onSubmitSuccess();
          })
          .catch((error) => {
            const response = error.response;
            if (response.errors) {
              const errors = this.state.errors;
              if (response.errors.children.email.errors && response.errors.children.email.errors.length > 0) {
                errors.email = ['registration.constraints.email.already_used'];
              }
              if (response.errors.children.captcha.errors && response.errors.children.captcha.errors.length > 0) {
                errors.captcha = ['registration.constraints.captcha.invalid'];
              }
              this.setState({ errors: errors });
              return onValidationFailure();
            }
            return onSubmitFailure();
          });
      }
      return onValidationFailure();
    }
  },

  setSuggestedEmail() {
    const form = JSON.parse(JSON.stringify(this.state.form));
    form.email = this.state.suggestedEmail;
    this.setState({ form: form, suggestedEmail: null });
  },

  checkMail() {
    mailcheck.run({
      email: this._email.refs.input.value,
      domains: domains,
      suggested: suggestion => this.setState({ suggestedEmail: suggestion.full }),
      empty: () => this.setState({ suggestedEmail: null }),
    });
  },
  formValidationRules: {
    username: {
      min: { value: 2, message: 'registration.constraints.username.min' },
      max: { value: 128, message: 'registration.constraints.username.max' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    email: {
      min: { value: 2, message: 'registration.constraints.email.min' },
      max: { value: 128, message: 'registration.constraints.email.max' },
      email: { message: 'registration.constraints.email.invalid' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    plainPassword: {
      min: { value: 8, message: 'registration.constraints.password.min' },
      max: { value: 128, message: 'registration.constraints.password.max' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    charte: {
      isTrue: { message: 'registration.constraints.charte.check' },
    },
    // captcha: {
    //   notBlank: { message: 'global.constraints.notBlank' },
    // },
  },

  handleCaptchaChange(value) {
    const form = JSON.parse(JSON.stringify(this.state.form));
    form.captcha = value;
    this.setState({ form: form });
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    const { features, user_types } = this.props;
    return (
      <form id="registration-form">
        {
          features.user_type &&
            <Input
              id="_user_type"
              type="select"
              valueLink={this.linkState('form.userType')}
              label={this.getIntlMessage('registration.type')}
              groupClassName={this.getGroupStyle('userType')}
              errors={this.renderFormErrors('userType')}
            >
              <option value="" disabled selected>
                {this.getIntlMessage('global.select')}
              </option>
              {
                user_types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)
              }
            </Input>
        }
        <Input
          id="_username"
          type="text"
          autoFocus
          valueLink={this.linkState('form.username')}
          label={this.getIntlMessage('registration.username') + ' *'}
          groupClassName={this.getGroupStyle('username')}
          errors={this.renderFormErrors('username')}
          help={this.getIntlMessage('registration.help.username')}
        />
        <Input
          id="_email"
          ref={c => this._email = c}
          type="text"
          valueLink={this.linkState('form.email')}
          label={this.getIntlMessage('global.email') + ' *'}
          groupClassName={this.getGroupStyle('email')}
          errors={this.renderFormErrors('email')}
          onBlur={this.checkMail}
        />
        {this.state.suggestedEmail
          ? <p className="registration__help">
              { this.getIntlMessage('global.typo') } <a onClick={this.setSuggestedEmail} className="js-email-correction">{ this.state.suggestedEmail }</a> ?
            </p>
          : null
        }
        <Input
          id="_password"
          type="password"
          valueLink={this.linkState('form.plainPassword')}
          label={this.getIntlMessage('global.password') + ' *'}
          groupClassName={this.getGroupStyle('plainPassword')}
          errors={this.renderFormErrors('plainPassword')}
        />
        {
          features.zipcode_at_register &&
            <Input
              id="_zipcode"
              type="text"
              valueLink={this.linkState('form.zipcode')}
              label={this.getIntlMessage('registration.zipcode') + ' *'}
              groupClassName={this.getGroupStyle('zipcode')}
              errors={this.renderFormErrors('zipcode')}
            />
        }
        <Input
          id="_charte"
          type="checkbox"
          valueLink={this.linkState('form.charte')}
          label={this.getIntlMessage('registration.charte')}
          groupClassName={this.getGroupStyle('charte')}
          errors={this.renderFormErrors('charte')}
        />
        <div className={this.getGroupStyle('captcha')}>
          <ReCAPTCHA
            sitekey="6LctYxsTAAAAANsAl06GxNeV5xGaPjy5jbDe-J8M"
            onChange={this.handleCaptchaChange}
          />
          {this.renderFormErrors('captcha')}
        </div>
      </form>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.features,
    user_types: state.user_types,
  };
};

export default connect(mapStateToProps)(RegistrationForm);
