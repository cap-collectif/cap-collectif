import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Form from '../Form/Form';

const validate = values => {
  const errors = {};
  if (!values.status) {
    errors.status = 'source.constraints.category';
  }
  if (!values.body || values.body.replace(/<\/?[^>]+(>|$)/g, '').length < 2) {
    errors.body = 'source.constraints.body';
  }
  return errors;
};

const ReportForm = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <Form
        form="report-form"
        ref={c => this.form = c}
        validate={validate}
        onSubmit={this.props.onSubmit}
        fields={[
          {
            id: 'reportType',
            name: 'status',
            label: this.getIntlMessage('global.modal.report.form.status'),
            type: 'select',
            disabledOptionLabel: 'global.select',
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
            type: 'editor',
          },
        ]
      }
    />
  );
  },

});

export default ReportForm;
