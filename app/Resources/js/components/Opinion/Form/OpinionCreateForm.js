// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import Fetcher, { json } from '../../../services/Fetcher';
import type { Dispatch } from '../../../types';
import renderInput from '../../Form/Field';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';

export const formName = 'opinion-create-form';
const onSubmit = (data: Object, dispatch: Dispatch, props: Object) => {
  const { opinionType, projectId, stepId } = props;
  const appendices = opinionType.appendixTypes
    .filter(type => data[type.title] && data[type.title].length > 0)
    .map(type => ({ appendixType: type.id, body: data[type.title] }));
  const form = {
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.post(
    `/projects/${projectId}/steps/${stepId}/opinion_types/${opinionType.id}/opinions`,
    form,
  )
    .then(json)
    .then((opinion: Object) => {
      dispatch(closeOpinionCreateModal());
      window.location.href = opinion._links.show;
    });
};

const validate = ({ title, body }: Object) => {
  const errors = {};
  if (!title || title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  return errors;
};

export const OpinionCreateForm = React.createClass({
  propTypes: {
    projectId: PropTypes.string.isRequired,
    stepId: PropTypes.string.isRequired,
    opinionType: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  },

  render() {
    const { opinionType, step, handleSubmit } = this.props;
    if (!opinionType) return null;
    return (
      <form id="opinion-create-form" onSubmit={handleSubmit}>
        <Field
          name="title"
          type="text"
          id="opinion_title"
          component={renderInput}
          help={step.titleHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor"
          id="opinion_body"
          component={renderInput}
          help={step.descriptionHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.body" />}
        />
        {opinionType.appendixTypes.map((field, index) => (
          <Field
            key={index}
            component={renderInput}
            name={field.title}
            label={field.title}
            type="editor"
            id={`appendix_${index}`}
          />
        ))}
      </form>
    );
  },
});

export default reduxForm({
  form: formName,
  onSubmit,
  validate,
})(OpinionCreateForm);
