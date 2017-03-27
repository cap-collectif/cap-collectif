// @flow
import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';
import { addNewRegistrationField as onSubmit } from '../../redux/modules/default';
import type { State } from '../../types';
import RegistrationQuestionForm from './RegistrationQuestionForm';

const validate = (values: Object) => {
  const errors = {};
  if (values.type === '4' && (!values.choices || values.choices.length < 2)) {
    errors.choices = { _error: 'Au moins 2 options requises.' };
  }
  return errors;
};

export const formName = 'add-registration-question';
export default reduxForm({
  onSubmit,
  validate,
  initialValues: {
    required: false,
    choices: [{ position: 1 }, { position: 2 }],
  },
  form: formName,
})(RegistrationQuestionForm);
