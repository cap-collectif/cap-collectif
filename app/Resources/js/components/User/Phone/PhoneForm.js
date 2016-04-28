import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserActions from '../../../actions/UserActions';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';

const PhoneForm = React.createClass({
  propTypes: {
    isSubmitting: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      form: {
        phone: '',
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
              this.setState(this.getInitialState());
              this.props.onSubmitSuccess();
            });
        })
        .catch(() => {
          this.setState({ hasError: true });
          this.props.onSubmitFailure();
        });
    }
  },

  render() {
    return (
      <form>
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
