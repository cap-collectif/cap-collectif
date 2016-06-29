import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';

const OpinionCreateForm = React.createClass({
  propTypes: {
    opinionType: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  handleSubmit(data) {
    const { opinionType, onSubmitSuccess, onFailure } = this.props;
    Fetcher
      .post(`/projects/${opinionType.projectId}/steps/${opinionType.stepId}/opinion_types/${opinionType.id}/opinions`, data)
      .then(json)
      .then((opinion) => {
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
        fields={[
          { name: 'title', type: 'text' },
          { name: 'body', type: 'editor' },
        ]}
      />
    );
  },

});

export default OpinionCreateForm;
