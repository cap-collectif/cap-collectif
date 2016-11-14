import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import component from './Field';
import { renderSelect } from '../Form/Select';

export const Form = React.createClass({
  displayName: 'Form',
  propTypes: {
    form: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    translations: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return { translations: {} };
  },

  render() {
    const {
      form,
      fields,
      onSubmit,
      translations,
    } = this.props;
    for (const field of fields) {
      field.label = translations[field.label] ? this.getIntlMessage(translations[field.label]) : field.label;
    }
    return (
      <form id={form} onSubmit={onSubmit}>
        {
          fields.map((field, index) =>
            <Field
              key={index}
              autoFocus={index === 0}
              component={field.type === 'newSelect' ? renderSelect : component}
              {...field}
              children={
                field.options ?
                [
                  field.defaultOptionLabel && <option key={0} value="">{field.defaultOptionLabel}</option>,
                ].concat(
                  field.options.map((opt, i) => <option key={i + 1} value={opt.value}>{opt.label}</option>)
                ) : null
              }
            />
          )
        }
      </form>
    );
  },

});

export default reduxForm()(Form);
