import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Field as component } from './Field';

export const Form = React.createClass({
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
        fields.map((field, index) =>
            <Field
              key={index}
              autoFocus={index === 0}
              component={component}
              {...field}
            />
        )
      }
      </form>
    );
  },

});

export default reduxForm()(Form);
