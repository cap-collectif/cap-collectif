// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm, formValueSelector, isDirty } from 'redux-form';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import renderInput from '../Form/Field';
import { updateRegistrationCommunicationForm as onSubmit } from '../../redux/modules/default';
import type { State } from '../../types';

export const formName = 'admin-communication-registration';
export const RegistrationCommunicationForm = React.createClass({
  propTypes: {
    useTopText: PropTypes.bool.isRequired,
    useBottomText: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },

  render() {
    const { submitting, handleSubmit, useTopText, useBottomText } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="topTextDisplayed"
          type="checkbox"
          label={'Afficher un message personnalisé au dessus du formulaire'}
          component={renderInput}
        />
        {useTopText &&
          <Field name="topText" type="editor" component={renderInput} />}
        <Field
          name="bottomTextDisplayed"
          type="checkbox"
          label={'Afficher un message personnalisé en dessous du formulaire'}
          component={renderInput}
        />
        {useBottomText &&
          <Field name="bottomText" type="editor" component={renderInput} />}
        <Button
          type="submit"
          disabled={submitting}
          style={{ marginBottom: 15 }}>
          {submitting
            ? <FormattedMessage id="global.loading" />
            : <FormattedMessage id="global.save" />}
        </Button>
      </form>
    );
  },
});

const mapStateToProps = (state: State) => ({
  useTopText: isDirty(formName)(state)
    ? formValueSelector(formName)(state, 'topTextDisplayed') === true
    : state.user.registration_form.topTextDisplayed,
  useBottomText: isDirty(formName)(state)
    ? formValueSelector(formName)(state, 'bottomTextDisplayed') === true
    : state.user.registration_form.bottomTextDisplayed,
  initialValues: {
    topTextDisplayed: state.user.registration_form.topTextDisplayed,
    topText: state.user.registration_form.topText,
    bottomText: state.user.registration_form.bottomText,
    bottomTextDisplayed: state.user.registration_form.bottomTextDisplayed,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    onSubmit,
    form: formName,
  })(RegistrationCommunicationForm),
);
