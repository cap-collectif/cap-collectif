import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import UserActions from '../../../actions/UserActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
import FeatureStore from '../../../stores/FeatureStore';

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
      },
      errors: {
        username: [],
        email: [],
        plainPassword: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    const { isSubmitting, onSubmitSuccess, onSubmitFailure, onValidationFailure } = this.props;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (this.isValid()) {
        const form = this.state.form;
        return UserActions
          .register(form)
          .then(() => {
            this.setState(this.getInitialState());
            onSubmitSuccess();
            window.location.reload();
          })
          .catch(onSubmitFailure);
      }
      onValidationFailure();
    }
  },

  formValidationRules: {
    username: {
      min: { value: 2, message: 'proposal.constraints.title' },
      notBlank: { message: 'proposal.constraints.title' },
    },
    email: {
      min: { value: 2, message: 'proposal.constraints.title' },
      notBlank: { message: 'proposal.constraints.title' },
    },
    plainPassword: {
      min: { value: 2, message: 'proposal.constraints.body' },
      notBlank: { message: 'proposal.constraints.body' },
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
          label={this.getIntlMessage('proposal.title') + ' *'}
          groupClassName={this.getGroupStyle('username')}
          errors={this.renderFormErrors('username')}
          help="Votre nom sera rendu public sur le site."
        />
        <Input
          id="_email"
          type="text"
          valueLink={this.linkState('form.email')}
          label={this.getIntlMessage('proposal.title') + ' *'}
          groupClassName={this.getGroupStyle('email')}
          errors={this.renderFormErrors('email')}
        />
        <Input
          id="_password"
          type="text"
          valueLink={this.linkState('form.plainPassword')}
          label={this.getIntlMessage('proposal.title') + ' *'}
          groupClassName={this.getGroupStyle('plainPassword')}
          errors={this.renderFormErrors('plainPassword')}
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
