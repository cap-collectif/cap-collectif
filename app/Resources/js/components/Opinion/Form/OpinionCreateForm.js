import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm, { defaultValidation } from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';

const OpinionCreateForm = React.createClass({
  propTypes: {
    projectId: PropTypes.number.isRequired,
    stepId: PropTypes.number.isRequired,
    opinionType: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(data) {
    const { opinionType, projectId, stepId, onSubmitSuccess, onFailure } = this.props;
    const appendices = this.props.opinionType.appendixTypes
      .filter((type) => data[type.title] && data[type.title].length > 0)
      .map((type) => {
        return { appendixType: type.id, body: data[type.title] };
      });
    const form = {
      title: data.title,
      body: data.body,
      appendices,
    };
    return Fetcher
        .post(`/projects/${projectId}/steps/${stepId}/opinion_types/${opinionType.id}/opinions`, form)
        .then(json)
        .then((opinion) => {
          this.form.reset();
          onSubmitSuccess();
          window.location.href = opinion._links.show;
        })
        .catch(onFailure)
    ;
  },

  render() {
    if (!this.props.opinionType) return;
    const dynamicsField = this.props.opinionType.appendixTypes.map((type) => {
      return { name: type.title, type: 'editor' };
    });
    return (
      <OpinionForm
        form="opinion-create-form"
        validate={defaultValidation}
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={this.props.onFailure}
        fields={[
          { name: 'title', type: 'text', id: 'opinion_title' },
          { name: 'body', type: 'editor', id: 'opinion_body' },
        ].concat(dynamicsField)
      }
      />
    );
  },

});

export default OpinionCreateForm;
