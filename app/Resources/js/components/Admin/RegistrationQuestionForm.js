// @flow
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect, type MapStateToProps, type Connector } from 'react-redux';
import { Field, FieldArray, formValueSelector } from 'redux-form';
import { Button, Alert } from 'react-bootstrap';
import renderInput from '../Form/Field';
import type { State } from '../../types';

const renderDynamicFields = (
  { fields, meta: { error } }, // eslint-disable-line
) => (
  <div>
    <p>Options</p>
    {error && <Alert bsStyle="danger">{error}</Alert>}
    {fields.map((field, index) => (
      <div key={index} className="row" style={{ marginBottom: 10 }}>
        <Field
          name={`${field}.label`}
          type="text"
          component={renderInput}
          wrapperClassName="col-sm-10"
        />
        <div className="col-sm-2" style={{ marginTop: -15 }}>
          <Button onClick={() => fields.remove(index)}>Retirer</Button>
        </div>
      </div>
    ))}
    <div>
      <Button onClick={() => fields.push({})}>Ajouter</Button>
    </div>
  </div>
);

type Props = {
  showChoices: boolean,
  intl: IntlShape,
};

export class RegistrationQuestionForm extends React.Component<Props> {
  render() {
    const { showChoices, intl } = this.props;
    return (
      <form>
        <Field
          name="question"
          type="text"
          label={<FormattedMessage id="global.title" />}
          component={renderInput}
        />
        <Field
          name="required"
          type="checkbox"
          children={<FormattedMessage id="global.admin.required" />}
          component={renderInput}
        />
        <Field name="type" type="select" label="Type" component={renderInput}>
          <option value="" disabled>
            {intl.formatMessage({ id: 'global.select' })}
          </option>
          <option value={0}>{intl.formatMessage({ id: 'global.question.types.text' })}</option>
          <option value={4}>{intl.formatMessage({ id: 'global.question.types.select' })}</option>
        </Field>
        {showChoices && <FieldArray name="choices" component={renderDynamicFields} />}
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: { form: string }) => ({
  showChoices: formValueSelector(props.form)(state, 'type') === '4',
});
const connector: Connector<{ form: string, intl: IntlShape }, Props> = connect(mapStateToProps);
const container = connector(RegistrationQuestionForm);
export default injectIntl(container);
