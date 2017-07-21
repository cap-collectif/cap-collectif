import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import UserActions from '../../../actions/UserActions';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';
import FormMixin from '../../../utils/FormMixin';
import FlashMessages from '../../Utils/FlashMessages';

const SmsCodeForm = React.createClass({
  propTypes: {
    onSubmitSuccess: PropTypes.func.isRequired,
  },

  mixins: [DeepLinkStateMixin, FormMixin],

  getInitialState() {
    return {
      isSubmitting: false,
      form: {
        code: '',
      },
      errors: {
        code: [],
      },
    };
  },

  formValidationRules: {
    code: {
      min: { value: 6, message: 'phone.confirm.constraints.code' },
      max: { value: 6, message: 'phone.confirm.constraints.code' },
      notBlank: { message: 'phone.confirm.constraints.code' },
    },
  },

  handleSubmit(e) {
    const { onSubmitSuccess } = this.props;
    e.preventDefault();
    if (this.isValid()) {
      const form = JSON.parse(JSON.stringify(this.state.form));
      this.setState({ isSubmitting: true });
      UserActions.sendSmsCode(form)
        .then(() => {
          this.setState(this.getInitialState());
          onSubmitSuccess();
        })
        .catch(error => {
          const response = error.response;
          const errors = this.state.errors;
          if (response.message === 'sms_code_invalid') {
            errors.code = ['phone.confirm.code_invalid'];
            this.setState({ errors, isSubmitting: false });
          }
        });
    }
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
      <form onSubmit={this.handleSubmit} style={{ maxWidth: '350px' }}>
        <Input
          type="text"
          buttonAfter={
            <Button
              type="submit"
              bsStyle="primary"
              style={{ padding: '6px 12px 7px' }}
              disabled={this.state.isSubmitting}>
              {this.state.isSubmitting
                ? <FormattedMessage id="global.loading" />
                : <FormattedMessage id="phone.confirm.validate" />}
            </Button>
          }
          autoFocus
          valueLink={this.linkState('form.code')}
          id="_code"
          label={<FormattedMessage id="phone.confirm.code" />}
          groupClassName={`${this.getGroupStyle('code')} form-group--no-margin`}
          errors={this.renderFormErrors('code')}
        />
      </form>
    );
  },
});

export default SmsCodeForm;
