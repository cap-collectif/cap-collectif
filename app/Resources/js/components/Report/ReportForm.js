import React, {PropTypes} from 'react';
import {IntlMixin} from 'react-intl';
import FormMixin from '../../utils/FormMixin';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';
import FlashMessages from '../Utils/FlashMessages';
import Input from '../Form/Input';

const ReportForm = React.createClass({
  propTypes: {
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onValidationSuccess: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    return {
      form: {
        status: null,
        body: '',
      },
      statuses: [
        {id: 0, label: 'reporting.status.sexual'},
        {id: 1, label: 'reporting.status.offending'},
        {id: 2, label: 'reporting.status.spam'},
        {id: 3, label: 'reporting.status.error'},
        {id: 4, label: 'reporting.status.off_topic'},
      ],
      errors: {
        status: [],
        body: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    const {onValidationFailure, onValidationSuccess} = this.props;
    if (nextProps.isSubmitting) {
      if (this.isValid()) {
        onValidationSuccess(this.state.form);
        return;
      }
      onValidationFailure();
      return;
    }
  },

  formValidationRules: {
    body: {
      min: {value: 2, message: 'source.constraints.body'},
      notBlank: {message: 'source.constraints.body'},
    },
    status: {
      notBlank: {message: 'source.constraints.category'},
    },
  },

  renderFormErrors(field) {
    return (
      <FlashMessages
        errors={this.getErrorsMessages(field)}
        form
      />
    );
  },

  render() {
    return (
      <form ref="form">
        <Input
          type="select"
          ref="status"
          id="reportType"
          valueLink={this.linkState('form.status')}
          label={this.getIntlMessage('global.modal.report.form.status')}
          groupClassName={this.getGroupStyle('status')}
          errors={this.renderFormErrors('status')}
        >
          {
            <option value="" disabled selected>
              {this.getIntlMessage('global.select')}
            </option>
          }
          {
            this.state.statuses.map((status) => {
              return (
                <option
                  key={status.id}
                  value={status.id}
                >
                  {this.getIntlMessage(status.label)}
                </option>
              );
            })
          }
        </Input>
        <Input
          type="editor"
          id="reportBody"
          valueLink={this.linkState('form.body')}
          label={this.getIntlMessage('global.modal.report.form.body')}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
        />
      </form>
    );
  },

});

export default ReportForm;
