import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import UserActions from '../../../actions/UserActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
// import FeatureStore from '../../../stores/FeatureStore';

const RegistrationForm = React.createClass({
  propTypes: {
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
        username: 'user2',
        email: 'user2@test.com',
        plainPassword: 'supersecureuserpass',
        charte: false,
      },
      errors: {
        username: [],
        email: [],
        plainPassword: [],
        charte: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    const { isSubmitting, onSubmitSuccess, onSubmitFailure, onValidationFailure } = this.props;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (this.isValid()) {
        const form = JSON.parse(JSON.stringify(this.state.form));
        delete form.charte;
        return UserActions
          .register(form)
          .then((response) => {
            if (response.user) {
              UserActions.login({ _username: form.email, _password: form.plainPassword });
              this.setState(this.getInitialState());
              onSubmitSuccess();
              return;
            }
            if (response.errors && response.errors.children.email.errors.length > 0) {
              const errors = this.state.errors;
              errors.email = ['registration.constraints.email.already_used'];
              this.setState({ errors: errors });
              onValidationFailure();
              return;
            }
            onSubmitFailure();
            return;
          });
      }
      onValidationFailure();
    }
  },

  formValidationRules: {
    username: {
      min: { value: 2, message: 'registration.constraints.username.min' },
      max: { value: 128, message: 'registration.constraints.username.max' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    email: {
      min: { value: 2, message: 'registration.constraints.email.min' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    plainPassword: {
      min: { value: 8, message: 'registration.constraints.password.min' },
      max: { value: 128, message: 'registration.constraints.password.max' },
      notBlank: { message: 'global.constraints.notBlank' },
    },
    charte: {
      isTrue: { message: 'global.constraints.notBlank' },
    },
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    return (
      <form id="registration-form">
        <Input
          id="_username"
          type="text"
          valueLink={this.linkState('form.username')}
          label={this.getIntlMessage('registration.username') + ' *'}
          groupClassName={this.getGroupStyle('username')}
          errors={this.renderFormErrors('username')}
          help={this.getIntlMessage('registration.help.username')}
        />
        <Input
          id="_email"
          type="text"
          valueLink={this.linkState('form.email')}
          label={this.getIntlMessage('global.email') + ' *'}
          groupClassName={this.getGroupStyle('email')}
          errors={this.renderFormErrors('email')}
        />
        <Input
          id="_password"
          type="password"
          valueLink={this.linkState('form.plainPassword')}
          label={this.getIntlMessage('global.password') + ' *'}
          groupClassName={this.getGroupStyle('plainPassword')}
          errors={this.renderFormErrors('plainPassword')}
        />
        <Input
          id="_charte"
          type="checkbox"
          valueLink={this.linkState('form.charte')}
          label={this.getIntlMessage('registration.charte')}
          groupClassName={this.getGroupStyle('charte')}
          errors={this.renderFormErrors('charte')}
        />
        <div
          className="g-recaptcha"
          data-sitekey="6LfKLxsTAAAAANGSsNIlspDarsFFK53b4bKiBYKC"
        />
      </form>
    );
  },

});

export default RegistrationForm;
