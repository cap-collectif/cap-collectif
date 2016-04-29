import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
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
      form.phone = '+33' + form.phone;
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
          this.setState({ errors: error.response.errors });
          this.props.onSubmitFailure();
          return onValidationFailure();
        });
    }
  },

  render() {
    return (
      <form style={{ maxWidth: '350px' }}>
        <Input
          type="phone"
          addonBefore="+33"
          autoFocus
          valueLink={this.linkState('form.phone')}
          id="_phone"
          label={'Numéro de téléphone'}
        />
      </form>
    );
  },

});

export default PhoneForm;
