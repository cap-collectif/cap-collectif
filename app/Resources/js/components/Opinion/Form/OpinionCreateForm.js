import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';

const OpinionCreateForm = React.createClass({
  propTypes: {
    opinionTypeId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    stepId: PropTypes.number.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(data) {
    console.log('handleSubmit');
    const { projectId, stepId, opinionTypeId, onSubmitSuccess, onFailure } = this.props;
    return Fetcher
        .post(`/projects/${projectId}/steps/${stepId}/opinion_types/${opinionTypeId}/opinions`, data)
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
    return (
      <OpinionForm
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={this.props.onFailure}
        fields={[
          { name: 'title', type: 'text' },
          { name: 'body', type: 'editor' },
        ]}
      />
    );
  },

});

export default OpinionCreateForm;
