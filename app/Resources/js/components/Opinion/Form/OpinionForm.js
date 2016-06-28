import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm } from 'redux-form';

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
  title: 'Titre',
  body: 'Body',
};

const OpinionForm = React.createClass({
  propTypes: {
    fields: PropTypes.object.isRequired,
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
        Object.keys(fields).map(name => {
          const field = fields[name];
          return (
            <div key={name}>
              <label>{labels[name]}</label>
              <div>
                <input type="text" placeholder={labels[name]} {...field} />
              </div>
              {
                field.touched && field.error && <div>{field.error}</div>
              }
            </div>
          );
        })
      }
        <button type="submit" disabled={submitting}>
          {submitting ? 'loading...' : 'Submit' }
        </button>
      </form>
    );
  },

});

const Form = reduxForm({ form: 'opinion', validate })(OpinionForm);
export default Form;
