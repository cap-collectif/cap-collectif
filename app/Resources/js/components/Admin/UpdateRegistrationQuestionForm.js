// @flow
import { reduxForm } from 'redux-form';
import { connect, type MapStateToProps, type Connector } from 'react-redux';
import { requestUpdateRegistrationField as onSubmit } from '../../redux/modules/default';
import type { State } from '../../types';
import RegistrationQuestionForm from './RegistrationQuestionForm';

const validate = (values: Object) => {
  const errors = {};
  if (values.type === '4' && (!values.choices || values.choices.length < 2)) {
    errors.choices = { _error: 'Au moins 2 options requises.' };
  }
  return errors;
};

const typeToEnum = (type: string) => {
  switch (type) {
    case 'select':
      return '4';
    case 'text':
      return '0';
    default:
      return '0';
  }
};

export const formName = 'update-registration-question';
const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  const fieldId = state.default.updatingRegistrationFieldModal;
  const field = state.user.registration_form.questions.find(f => f.id === fieldId);
  if (!field) {
    return { initialValues: {} };
  }
  return {
    fieldId,
    initialValues: {
      required: field.required,
      question: field.question,
      type: typeToEnum(field.type),
      choices: field.choices
        ? field.choices.map(choice => ({
            label: choice.label
          }))
        : undefined
    }
  };
};
type Props = {
  initialValues: Object
};
const connector: Connector<{}, Props> = connect(mapStateToProps);

export default connector(
  reduxForm({
    onSubmit,
    validate,
    form: formName
  })(RegistrationQuestionForm)
);
