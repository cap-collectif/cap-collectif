import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import component from './Field';

export const Form = React.createClass({
  displayName: 'Form',
  propTypes: {
    form: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    translations: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return { translations: {} };
  },

  render() {
    const {
      form,
      fields,
      handleSubmit,
      translations,
    } = this.props;
    for (const field of fields) {
      field.label = translations[field.label] ? this.getIntlMessage(translations[field.label]) : field.label;
    }
    return (
      <form id={form} onSubmit={handleSubmit}>
      {
        fields.map((field, index) => {
          const children = field.options ?
          [
            field.default_option_label && <option key={0} value="">{field.default_option_label}</option>,
          ].concat(
            field.options.map((opt, i) => <option key={i + 1} value={opt.value}>{opt.label}</option>)
          ) : null;
          return (
            <Field
              key={index}
              autoFocus={index === 0}
              component={component}
              children={children}
              {...field}
            />
          );
        })
      }
      </form>
    );
  },

});

export default reduxForm()(Form);
