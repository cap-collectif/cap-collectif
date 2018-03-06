// @flow
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { reduxForm, Field, clearSubmitErrors, SubmissionError, type FormProps } from 'redux-form';
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
    appendices
  };
  return Fetcher.post(
    `/projects/${projectId}/steps/${stepId}/opinion_types/${opinionType.id}/opinions`,
    form
  )
    .then(json)
    .then((opinion: Object) => {
      dispatch(closeOpinionCreateModal());
      window.location.href = opinion._links.show;
    })
    .catch((res: Object) => {
      if (res && res.response && res.response.message === 'You contributed too many times.') {
        throw new SubmissionError({ _error: 'publication-limit-reached' });
      }
      throw new SubmissionError({ _error: 'global.error.server.form' });
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

type Props = FormProps & {
  projectId: string,
  stepId: string,
  opinionType: Object,
  step: Object
};

export class OpinionCreateForm extends React.Component<Props> {
  render() {
    const { opinionType, step, handleSubmit, error, dispatch } = this.props;
    if (!opinionType) return null;
    return (
      <form id="opinion-create-form" onSubmit={handleSubmit}>
        {error && (
          <Alert
            bsStyle="warning"
            onDismiss={() => {
              dispatch(clearSubmitErrors(formName));
            }}>
            {error === 'publication-limit-reached' ? (
              <div>
                <h4>
                  <strong>
                    <FormattedMessage id="publication-limit-reached" />
                  </strong>
                </h4>
                <FormattedMessage id="publication-limit-reached-proposal-content" />
              </div>
            ) : (
              <FormattedHTMLMessage id="global.error.server.form" />
            )}
          </Alert>
        )}
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
  }
}

export default reduxForm({
  form: formName,
  onSubmit,
  validate
})(OpinionCreateForm);
