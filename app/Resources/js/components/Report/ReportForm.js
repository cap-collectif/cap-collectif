import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Form from '../Form/Form';

const validate = ({ status, body }) => {
  const errors = {};
  if (!status) {
    errors.status = 'global.constraints.notBlank';
  }
  if (!body || body.length < 2) {
    errors.body = 'global.constraints.notBlank';
  }
  return errors;
};

const ReportForm = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { onSubmit } = this.props;
    return (
      <Form
        form="report-form"
        ref={c => this.form = c}
        validate={validate}
        onSubmit={onSubmit}
        fields={[
          {
            id: 'reportType',
            name: 'status',
            label: this.getIntlMessage('global.modal.report.form.status'),
            type: 'select',
            defaultOptionLabel: this.getIntlMessage('global.select'),
            options: [
              { value: 0, label: this.getIntlMessage('reporting.status.sexual') },
              { value: 1, label: this.getIntlMessage('reporting.status.offending') },
              { value: 2, label: this.getIntlMessage('reporting.status.spam') },
              { value: 3, label: this.getIntlMessage('reporting.status.error') },
              { value: 4, label: this.getIntlMessage('reporting.status.off_topic') },
            ],
          },
          {
            id: 'reportBody',
            name: 'body',
            label: this.getIntlMessage('global.modal.report.form.body'),
            type: 'textarea',
          },
        ]
      }
      />
  );
  },

});

export default ReportForm;
