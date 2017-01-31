import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { submitAccountForm as onSubmit } from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';

const form = 'account';
const validate = (values, { initialValues: { email } }): Object => {
  const errors = {};
  if (!values.email) {
    errors.email = 'global.required';
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email';
  }
  if (values.email === email) {
    errors.email = 'global.change.required';
  }
  return errors;
};

const AccountForm = React.createClass({
  propTypes: {
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {/* {
          error &&
            <Alert bsStyle="danger">
              <p>{error}</p>
            </Alert>
        } */}
        <Field
          type="email"
          component={renderComponent}
          name="email"
          id="account__email"
          label={this.getIntlMessage('proposal.vote.form.email')}
        />
      </form>
    );
  },

});

const mapStateToProps = state => ({
  initialValues: {
    email: state.default.user.email,
  },
});
export default connect(mapStateToProps)(reduxForm({
  form,
  validate,
  onSubmit,
})(AccountForm));
