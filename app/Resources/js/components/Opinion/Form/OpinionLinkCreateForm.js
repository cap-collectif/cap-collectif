import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionForm, { defaultValidation } from './OpinionForm';
import OpinionLinkSelectTypeForm from './OpinionLinkSelectTypeForm';
import Fetcher, { json } from '../../../services/Fetcher';

const OpinionLinkCreateForm = React.createClass({
  propTypes: {
    availableTypes: PropTypes.array.isRequired,
    opinion: PropTypes.object.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const { availableTypes } = this.props;
    return {
      currentType: availableTypes[0],
    };
  },

  submit() {
    this.form.form.submit();
  },

  isValid() {
    return this.form.form.valid;
  },

  handleSubmit(data) {
    const { opinion, onSubmitSuccess, onFailure, availableTypes } = this.props;
    const { currentType } = this.state;
    // We format appendices to call API (could be improved by changing api design)
    const appendices =
      Object.keys(data)
      .filter((key) => key !== 'title' && key !== 'body')
      .map((key) => {
        return {
          appendixType: availableTypes.filter(a => a.id === currentType.id)[0].appendixTypes.filter(t => t.title === key)[0].id,
          body: data[key],
        };
      }
    );
    const form = {
      OpinionType: currentType.id,
      title: data.title,
      body: data.body,
      appendices,
    };
    return Fetcher
        .post(`/opinions/${opinion.id}/links`, form)
        .then(json)
        .then((link) => {
          window.location.href = link._links.show;
          this.form.reset();
          onSubmitSuccess();
        })
        .catch(onFailure)
    ;
  },

  handleTypeChanged(type) {
    const { availableTypes } = this.props;
    this.setState({
      currentType: availableTypes.filter(t => t.id === type)[0],
    });
  },

  render() {
    const { availableTypes, onFailure } = this.props;
    const { currentType } = this.state;
    const dynamicsField = currentType.appendixTypes.map((type, index) => {
      return { label: type.title, name: type.title, type: 'editor', id: `opinion_appendix-${index + 1}` };
    });
    return (
      <div>
        <OpinionLinkSelectTypeForm
          onChange={this.handleTypeChanged}
          options={availableTypes}
          initialValues={{ opinionType: currentType.id }}
        />
        <OpinionForm
          form="opinion-link-create-form"
          validate={defaultValidation}
          ref={c => this.form = c}
          onSubmit={this.handleSubmit}
          onSubmitFail={onFailure}
          fields={[
              { label: 'title', name: 'title', type: 'text', id: 'opinion_title' },
              { label: 'body', name: 'body', type: 'editor', id: 'opinion_body' },
          ].concat(dynamicsField)}
        />
      </div>
    );
  },

});

export default OpinionLinkCreateForm;
