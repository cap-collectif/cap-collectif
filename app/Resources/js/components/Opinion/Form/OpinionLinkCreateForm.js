import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { reduxForm } from 'redux-form';
import OpinionLinkSelectTypeForm from './OpinionLinkSelectTypeForm';
import Fetcher, { json } from '../../../services/Fetcher';

const formName = 'opinion-link-create-form';

const onSubmit = data => {
  const { opinion, availableTypes } = this.props;
  const { currentType } = this.state;
  // We format appendices to call API (could be improved by changing api design)
  const appendices = Object.keys(data)
    .filter(key => key !== 'title' && key !== 'body')
    .map(key => {
      return {
        appendixType: availableTypes
          .filter(a => a.id === currentType.id)[0]
          .appendixTypes.filter(t => t.title === key)[0].id,
        body: data[key],
      };
    });
  const form = {
    OpinionType: currentType.id,
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.post(`/opinions/${opinion.id}/links`, form)
    .then(json)
    .then(link => {
      window.location.href = link._links.show;
    });
};

const OpinionLinkCreateForm = React.createClass({
  propTypes: {
    availableTypes: PropTypes.array.isRequired,
    opinion: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const { availableTypes } = this.props;
    return {
      currentType: availableTypes[0],
    };
  },

  handleTypeChanged(type) {
    const { availableTypes } = this.props;
    this.setState({
      currentType: availableTypes.filter(t => t.id === type)[0],
    });
  },

  render() {
    const { availableTypes, handleSubmit } = this.props;
    const { currentType } = this.state;
    // const dynamicsField = currentType.appendixTypes.map((type, index) => {
    //   return {
    //     label: type.title,
    //     name: type.title,
    //     type: 'editor',
    //     id: `opinion_appendix-${index + 1}`,
    //   };
    // });
    return (
      <form id={formName} onSubmit={handleSubmit}>
        <OpinionLinkSelectTypeForm
          onChange={this.handleTypeChanged}
          options={availableTypes}
          initialValues={{ opinionType: currentType.id }}
        />
        {/* fields={[
          { label: 'title', name: 'title', type: 'text', id: 'opinion_title' },
          { label: 'body', name: 'body', type: 'editor', id: 'opinion_body' },
        ].concat(dynamicsField)} */}
      </form>
    );
  },
});

export default reduxForm({
  form: formName,
  onSubmit,
})(OpinionLinkCreateForm);
