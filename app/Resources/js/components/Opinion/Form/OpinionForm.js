import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import Input from '../../Form/Input';

const validate = values => {
  const errors = {};
  if (!values.title || values.title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!values.body || values.body.length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  return errors;
};

const labels = {
  title: 'opinion.title',
  body: 'opinion.body',
};

const renderField = props => (
    <Input
      type={props.type}
      labelClassName={''}
      label={props.label}
      placeholder={props.placeholder || props.label}
      errors={(props.touched && props.error) ? props.error : null}
      bsStyle={props.touched ? (props.error ? 'error' : 'success') : null}
      hasFeedback={props.touched}
      {...props}
    />
);

const OpinionForm = React.createClass({
  propTypes: {
    fields: PropTypes.array.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      fields,
      handleSubmit,
    } = this.props;
    return (
      <form id="opinion-form" onSubmit={handleSubmit}>
      {
        fields.map((field, index) => {
          return (
            <Field
              key={index}
              autoFocus={index === 0}
              label={this.getIntlMessage(labels[field.name])}
              name={field.name}
              type={field.type}
              component={renderField}
              placeholder={field.name}
            />
          );
        })
      }
      </form>
    );
  },

});

export default reduxForm({
  form: 'opinion',
  validate,
})(OpinionForm);
