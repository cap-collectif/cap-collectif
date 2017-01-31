import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { submitPasswordForm as onSubmit } from '../../redux/modules/user';
import renderComponent from '../Form/Field';

const form = 'password';
const AccountForm = React.createClass({
  propTypes: {
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          type="password"
          component={renderComponent}
          name="password"
          id="account__password"
          label={this.getIntlMessage('global.password')}
        />
      </form>
    );
  },
});

export default reduxForm({ form, onSubmit })(AccountForm);
