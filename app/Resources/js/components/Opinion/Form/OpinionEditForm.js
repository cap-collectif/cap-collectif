import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm from './OpinionForm';
import Fetcher, { json } from '../../../services/Fetcher';

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
      .filter((key) => key !== 'title' && key !== 'body')
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
      appendices: appendices,
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

  render() {
    const { opinion } = this.props;
    const dynamicsInitialValues = {};
    for (const appendix of opinion.appendices) {
      dynamicsInitialValues[appendix.type.title] = appendix.body;
    }
    return (
      <OpinionForm
        ref={c => this.form = c}
        onSubmit={this.handleSubmit}
        onSubmitFail={this.props.onFailure}
        fields={[
          { name: 'title', type: 'text' },
          { name: 'body', type: 'editor' },
        ].concat(opinion.appendices.map((a) => { return { name: a.type.title, type: 'editor' }; }))
      }
      initialValues={$.extend(
        {},
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
