// @flow
import { reduxForm } from 'redux-form';
import { addNewRegistrationField as onSubmit } from '../../redux/modules/default';
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
    choices: [{}, {}],
  },
  form: formName,
})(RegistrationQuestionForm);
