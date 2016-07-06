import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';

const validate = values => {
  const errors = {};
  if (!values.title || values.title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!values.body || values.body.length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  if (!values.check) {
    errors.check = 'global.constraints.check';
  }
  return errors;
};

const OpinionEditForm = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(data) {
    const { opinion, onFailure } = this.props;
    // We format appendices to call API (could be improved by changing api design)
    const appendices =
      Object.keys(data)
      .filter((key) => key !== 'title' && key !== 'body' && key !== 'check')
      .map((key) => {
        return {
          appendixType: opinion.appendices.filter((a) => a.type.title === key)[0].type.id,
          body: data[key],
        };
      }
    );
    const form = {
      title: data.title,
      body: data.body,
      appendices,
    };
    return Fetcher
        .put(`/opinions/${this.props.opinion.id}`, form)
        .then(json)
        .then((opinionUpdated) => {
          window.location.href = opinionUpdated._links.show;
        })
        .catch(onFailure)
    ;
  },

  submit() {
    this.form.form.submit();
  },

  isValid() {
    return this.form.form.valid;
  },

  render() {
    const { opinion, onFailure } = this.props;
    const dynamicsInitialValues = {};
    for (const appendix of opinion.appendices) {
      dynamicsInitialValues[appendix.type.title] = appendix.body;
    }
    return (
      <OpinionForm
        form="opinion-edit-form"
        validate={validate}
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={onFailure}
        fields={[
          { name: 'check', label: 'check', type: 'checkbox', id: 'opinion_check', divClassName: 'alert alert-warning edit-confirm-alert' },
          { name: 'title', label: 'name', type: 'text', id: 'opinion_title' },
          { name: 'body', label: 'body', type: 'editor', id: 'opinion_body' },
        ].concat(opinion.appendices.map((a, i) => { return { label: a.type.title, name: a.type.title, type: 'editor', id: 'opinion_appendix-' + (i + 1) }; }))}
        initialValues={$.extend({},
          { title: opinion.title,
            body: opinion.body,
          },
          dynamicsInitialValues
        )}
      />
    );
  },

});

export default OpinionEditForm;
