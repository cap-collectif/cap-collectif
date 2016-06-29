import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Input } from 'react-bootstrap';
import Editor from '../../Form/Editor';

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

const renderField = props => {
  if (props.type === 'editor') {
    return (
      <Editor
        id={props.id || null}
        {...props}
      />
    );
  }
  return (
    <Input
      type={props.type}
      label={props.label || 'No label'}
      placeholder={props.placeholder || props.label}
      help={props.touched && props.error && <span>{props.error}</span>}
      bsStyle={props.touched ? (props.error ? 'error' : 'success') : null}
      hasFeedback={props.touched}
      {...props}
    />
  );
};

const OpinionForm = React.createClass({
  propTypes: {
    fields: PropTypes.array.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      fields,
      handleSubmit,
      submitting,
    } = this.props;
    return (
      <form id="opinion-form" onSubmit={handleSubmit}>
      {
        fields.map((field, index) => {
          return (
            <Field
              key={index}
              label={this.getIntlMessage(labels[field.name])}
              name={field.name}
              type={field.type}
              component={renderField}
              placeholder={field.name}
            />
          );
        })
      }
        {/*<button type="submit" disabled={submitting}>
          {submitting ? 'loading...' : 'Submit' }
        </button>*/}
      </form>
    );
  },

});

export default reduxForm({
  form: 'opinion',
  validate,
})(OpinionForm);
