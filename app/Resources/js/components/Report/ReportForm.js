// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
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

const ReportForm = React.createClass({
  propTypes: {
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleSubmit } = this.props;
    return (
      <form id={formName} onSubmit={handleSubmit}>
        <Field
          id="reportType"
          name="status"
          component={renderInput}
          label={this.getIntlMessage('global.modal.report.form.status')}
          type="select"
          clearable={false}
          inputClassName={null}
          labelClassName={null}>
          <option value={-1}>{this.getIntlMessage('global.select')}</option>
          <option value={1}>
            {this.getIntlMessage('reporting.status.offending')}
          </option>
          <option value={2}>
            {this.getIntlMessage('reporting.status.spam')}
          </option>
          <option value={3}>
            {this.getIntlMessage('reporting.status.error')}
          </option>
          <option value={4}>
            {this.getIntlMessage('reporting.status.off_topic')}
          </option>
        </Field>
        <Field
          id="reportBody"
          name="body"
          component={renderInput}
          label={this.getIntlMessage('global.modal.report.form.body')}
          type="textarea"
        />
      </form>
    );
  },
});

export default reduxForm({
  form: formName,
  validate,
})(ReportForm);
