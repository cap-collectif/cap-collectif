import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Form from '../../Form/Form';

export const defaultValidation = ({ title, body }) => {
  const errors = {};
  if (!title || title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  return errors;
};

export const labels = {
  title: 'opinion.title',
  body: 'opinion.body',
  check: 'opinion.edit_check',
};

const OpinionForm = React.createClass({
  displayName: 'OpinionForm',
  propTypes: {
    form: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <Form
        ref={c => this.form = c}
        translations={labels}
        {...this.props}
      />
    );
  },
});

export default OpinionForm;
