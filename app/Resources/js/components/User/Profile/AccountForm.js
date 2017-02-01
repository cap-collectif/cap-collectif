import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';
import { submitAccountForm as onSubmit } from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';

export const form = 'account';
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
    newEmailToConfirm: PropTypes.string,
    error: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleSubmit, error, newEmailToConfirm } = this.props;
    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        {
          error &&
            <Alert bsStyle="danger">
              <p>{error}</p>
            </Alert>
        }
        <Field
          type="email"
          component={renderComponent}
          name="email"
          id="account__email"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"
          label={this.getIntlMessage('proposal.vote.form.email')}
        />
        <p className="small excerpt col-sm-6 col-sm-offset-4">
          Votre adresse électronique ne sera pas rendue publique.
        </p>
        {
          newEmailToConfirm &&
            <p className="small excerpt col-sm-6 col-sm-offset-4">
              Vérifiez votre email (contacta@spyl.net) pour confirmer votre nouvelle adresse. Jusqu'à ce que vous confirmez, les notifications continueront d'être envoyées à votre adresse email actuelle.
              <Button onClick={() => {}}>Renvoyer la confirmation</Button> · <Button>Annuler cette modification</Button>
            </p>
        }
      </form>
    );
  },

});

const mapStateToProps = state => ({
  newEmailToConfirm: state.user.user.newEmailToConfirm,
  initialValues: {
    email: state.user.user.email,
  },
});
export default connect(mapStateToProps)(reduxForm({
  form,
  validate,
  onSubmit,
})(AccountForm));
