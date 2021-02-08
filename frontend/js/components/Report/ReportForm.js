// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import renderInput from '../Form/Field';
import type { ReportingType } from '~relay/ReportMutation.graphql';

type Props = ReduxFormFormProps;

export type Values = {|
  status: string,
  body: string,
|};

export const formName = 'report-form';

const validate = ({ status, body }: Values) => {
  const errors = {};

  if (!status || status === '-1') {
    errors.status = 'global.constraints.notBlank';
  }

  if (!body || body.length < 2) {
    errors.body = 'global.constraints.notBlank';
  }

  return errors;
};

export const getType = (status: string): ReportingType => {
  switch (status) {
    case '1':
      return 'OFF';
    case '2':
      return 'SPAM';
    case '3':
      return 'ERROR';
    case '4':
      return 'SEX';
    case '5':
      return 'OFF_TOPIC';
    default:
      throw Error(`status ${status} is not a valid status`);
  }
};

const ReportForm: React.StatelessFunctionalComponent<Props> = ({ handleSubmit }: Props) => {
  const intl = useIntl();

  return (
    <form id={formName} onSubmit={handleSubmit}>
      <Field
        id="reportType"
        name="status"
        component={renderInput}
        label={<FormattedMessage id="global.modal.report.form.status" />}
        type="select"
        clearable={false}
        inputClassName={null}
        labelClassName={null}>
        <option value={-1}>{intl.formatMessage({ id: 'global.select' })}</option>
        <option value={1}>{intl.formatMessage({ id: 'reporting.status.offending' })}</option>
        <option value={2}>{intl.formatMessage({ id: 'reporting.status.spam' })}</option>
        <option value={3}>{intl.formatMessage({ id: 'reporting.status.error' })}</option>
        <option value={4}>{intl.formatMessage({ id: 'reporting.status.sexual' })}</option>
        <option value={5}>{intl.formatMessage({ id: 'reporting.status.off_topic' })}</option>
      </Field>
      <Field
        id="reportBody"
        name="body"
        component={renderInput}
        label={<FormattedMessage id="global.modal.report.form.body" />}
        type="textarea"
      />
    </form>
  );
};

const container = reduxForm({
  form: formName,
  validate,
})(ReportForm);

export default container;
