import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import UserActions from '../../../actions/UserActions';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';

const SmsCodeForm = React.createClass({
  propTypes: {
    onSubmitSuccess: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      form: {
        code: '',
      },
    };
  },

  handleSubmit() {
    const form = JSON.parse(JSON.stringify(this.state.form));
    UserActions
      .sendSmsCode(form)
      .then(() => {
        this.setState(this.getInitialState());
        this.props.onSubmitSuccess();
      })
      .catch(() => {
        this.setState(this.getInitialState());
      });
  },

  render() {
    return (
      <form onSubmit={this.handleSubmit} style={{ maxWidth: '350px' }} >
          <Input
            type="text"
            buttonAfter={
              <Button
                type="submit"
                bsStyle="primary"
                style={{ padding: '6px 12px 7px' }}
              >
                Valider le numéro
              </Button>
            }
            autoFocus
            valueLink={this.linkState('form.code')}
            id="_code"
            label={'Code de vérification'}
          />
      </form>
    );
  },

});

export default SmsCodeForm;
