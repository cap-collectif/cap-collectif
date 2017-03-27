// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Field, FieldArray, reduxForm, formValueSelector } from 'redux-form';
import { Button, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import renderInput from '../Form/Field';
import { addNewRegistrationField as onSubmit } from '../../redux/modules/default';
import type { State } from '../../types';

const validate = (values: Object) => {
  const errors = {};
  if (values.type === '4' && (!values.choices || values.choices.length < 2)) {
    errors.choices = { _error: 'Au moins 2 options requises.' };
  }
  return errors;
};

const renderDynamicFields = ({ fields, meta: { touched, error, submitFailed } }) => (
  <div>
    <label htmlFor="options">Options</label>
    { error && <Alert bsStyle="danger">{error}</Alert> }
    {
      fields.map((field, index) =>
        <div key={index} className="row" style={{ marginBottom: 10 }}>
          <Field
            name={`${field}.label`}
            type="text"
            component={renderInput}
            wrapperClassName="col-sm-10"
          />
          <div className="col-sm-2" style={{ marginTop: -15 }}>
            <Button onClick={() => fields.remove(index)}>
              Retirer
            </Button>
          </div>
        </div>,
      )
    }
    <div>
      <Button onClick={() => fields.push({})}>
        Ajouter
      </Button>
    </div>
  </div>
);

export const formName = 'add-new-question';
export const AddNewQuestionForm = React.createClass({
  propTypes: {
    showChoices: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { showChoices } = this.props;
    return (
      <form>
        <Field
          name="question"
          type="text"
          label={this.getIntlMessage('global.title')}
          component={renderInput}
        />
        <Field
          name="required"
          type="checkbox"
          label={'Saisie obligatoire'}
          component={renderInput}
        />
        <Field
          name="type"
          type="select"
          label={'Type'}
          component={renderInput}
        >
          <option value="" disabled>{this.getIntlMessage('global.select')}</option>
          <option value={0}>{this.getIntlMessage('global.question.types.text')}</option>
          {/* <option value={1}>{this.getIntlMessage('global.question.types.textarea')}</option> */}
          {/* <option value={2}>{this.getIntlMessage('global.question.types.editor')}</option> */}
          {/* <option value={3}>{this.getIntlMessage('global.question.types.radio')}</option> */}
          <option value={4}>{this.getIntlMessage('global.question.types.select')}</option>
          {/* <option value={5}>{this.getIntlMessage('global.question.types.checkbox')}</option> */}
          {/* <option value={6}>{this.getIntlMessage('global.question.types.ranking')}</option> */}
        </Field>
        {
          showChoices &&
            <FieldArray
              name="choices"
              component={renderDynamicFields}
            />
        }
      </form>
    );
  },
});

const mapStateToProps = (state: State) => ({
  showChoices: formValueSelector(formName)(state, 'type') === '4',
});
const connector = connect(mapStateToProps);
export default reduxForm({
  onSubmit,
  validate,
  initialValues: { required: false, choices: [{}, {}] },
  form: formName,
})(connector(AddNewQuestionForm));
