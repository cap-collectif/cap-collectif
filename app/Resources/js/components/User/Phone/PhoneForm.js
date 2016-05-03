import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FlashMessages from '../../Utils/FlashMessages';
import UserActions from '../../../actions/UserActions';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';
import FormMixin from '../../../utils/FormMixin';

const PhoneForm = React.createClass({
  propTypes: {
    isSubmitting: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    return {
      form: {
        phone: '',
      },
      errors: {
        phone: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting) {
      const form = JSON.parse(JSON.stringify(this.state.form));
      form.phone = '+33' + (form.phone.charAt(0) === '0' ? form.phone.substring(1) : form.phone);
      UserActions
        .update(form)
        .then(() => {
          UserActions
            .sendConfirmSms()
            .then(() => {
              this.props.onSubmitSuccess(form.phone);
              this.setState(this.getInitialState());
            });
        })
        .catch((error) => {
          const response = error.response;
          if (response.errors) {
            const errors = this.state.errors;
            if (response.errors.children.phone.errors && response.errors.children.phone.errors.length > 0) {
              if (response.errors.children.phone.errors[0] === 'already_used_phone') {
                errors.phone = ['profile.constraints.phone.already_used'];
              } else {
                errors.phone = ['profile.constraints.phone.invalid'];
              }
            }
            this.setState({ errors: errors });
          }
          this.props.onSubmitFailure();
        });
    }
  },

  formValidationRules: {
    phone: {
      notBlank: { message: 'global.constraints.notBlank' },
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
      <form style={{ maxWidth: '350px' }}>
        <Input
          type="text"
          addonBefore="+33"
          autoFocus
          valueLink={this.linkState('form.phone')}
          id="_phone"
          label={'Numéro de téléphone'}
          groupClassName={this.getGroupStyle('phone')}
          errors={this.renderFormErrors('phone')}
        />
      </form>
    );
  },

});

export default PhoneForm;
