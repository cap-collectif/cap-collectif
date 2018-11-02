// @flow
import React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import renderInput from '../Form/Field';

export const formName = 'report-form';
const validate = ({ status, body }) => {
  const errors = {};
  if (!status || status < 0) {
    errors.status = 'global.constraints.notBlank';
  }
  if (!body || body.length < 2) {
    errors.body = 'global.constraints.notBlank';
  }
  return errors;
};

type Props = {
  handleSubmit: Function,
  intl: IntlShape,
};

class ReportForm extends React.Component<Props> {
  render() {
    const { handleSubmit, intl } = this.props;
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
          <option value={4}>{intl.formatMessage({ id: 'reporting.status.off_topic' })}</option>
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
  }
}

const container = reduxForm({
  form: formName,
  validate,
})(ReportForm);

export default injectIntl(container);
