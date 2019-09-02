// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Alert, Panel, Label } from 'react-bootstrap';
import { reduxForm, Field, clearSubmitErrors, SubmissionError } from 'redux-form';
import Fetcher, { json } from '../../../services/Fetcher';
import renderInput from '../../Form/Field';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';
import type { Dispatch } from '../../../types';
import type { OpinionCreateForm_section } from '~relay/OpinionCreateForm_section.graphql';
import type { OpinionCreateForm_consultationStep } from '~relay/OpinionCreateForm_consultationStep.graphql';
import RequirementsForm from '../../Requirements/RequirementsForm';
import type { OpinionCreateForm_consultation } from '~relay/OpinionCreateForm_consultation.graphql';

type RelayProps = {|
  section: OpinionCreateForm_section,
  consultation: OpinionCreateForm_consultation,
  consultationStep: OpinionCreateForm_consultationStep,
|};
type FormValues = Object;
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
|};

export const formName = 'opinion-create-form';
const onSubmit = (data: FormValues, dispatch: Dispatch, props: Props) => {
  const { section, consultationStep } = props;
  const appendices = section.appendixTypes
    ? section.appendixTypes
        .filter(Boolean)
        .filter(type => data[type.title] && data[type.title].length > 0)
        .map(type => ({ appendixType: type.id, body: data[type.title] }))
    : [];
  const { project } = consultationStep;
  const form = {
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.post(
    `/projects/${project._id}/steps/${consultationStep.id}/opinion_types/${section.id}/opinions`,
    form,
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

const validate = ({ title, body }: FormValues) => {
  const errors = {};
  if (!title || title.length < 2) {
    errors.title = 'opinion.constraints.title';
  }
  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length < 2) {
    errors.body = 'opinion.constraints.body';
  }
  return errors;
};

export class OpinionCreateForm extends React.Component<Props> {
  renderRequirements() {
    const { consultationStep } = this.props;

    return (
      <Panel id="required-conditions" bsStyle="primary">
        <Panel.Heading>
          <FormattedMessage id="requirements" />{' '}
          {consultationStep.requirements.viewerMeetsTheRequirements && (
            <Label bsStyle="primary">
              <FormattedMessage id="filled" />
            </Label>
          )}
        </Panel.Heading>
        {!consultationStep.requirements.viewerMeetsTheRequirements && (
          <Panel.Body>
            <p>{consultationStep.requirements.reason}</p>
            <RequirementsForm step={consultationStep} />
          </Panel.Body>
        )}
      </Panel>
    );
  }

  render() {
    const { section, consultation, consultationStep, handleSubmit, error, dispatch } = this.props;
    if (!section) return null;
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
        {consultationStep.requirements.totalCount > 0 && this.renderRequirements()}
        <Field
          name="title"
          type="text"
          id="opinion_title"
          component={renderInput}
          help={consultation.titleHelpText}
          autoFocus
          label={<FormattedMessage id="opinion.title" />}
        />
        <Field
          name="body"
          type="editor"
          id="opinion_body"
          component={renderInput}
          help={consultation.descriptionHelpText}
          label={<FormattedMessage id="opinion.body" />}
        />
        {section.appendixTypes &&
          section.appendixTypes.filter(Boolean).map((field, index) => (
            <Field
              key={index}
              component={renderInput}
              // $FlowFixMe redux-form
              name={field.title}
              label={field.title}
              help={field.helpText}
              type="editor"
              id={`appendix_${index}`}
            />
          ))}
      </form>
    );
  }
}

const container = reduxForm({
  form: formName,
  onSubmit,
  validate,
})(OpinionCreateForm);

export default createFragmentContainer(container, {
  section: graphql`
    fragment OpinionCreateForm_section on Section {
      id
      appendixTypes {
        id
        title
        helpText
      }
    }
  `,
  consultation: graphql`
    fragment OpinionCreateForm_consultation on Consultation {
      titleHelpText
      descriptionHelpText
    }
  `,
  consultationStep: graphql`
    fragment OpinionCreateForm_consultationStep on ConsultationStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...RequirementsForm_step @arguments(isAuthenticated: $isAuthenticated)
      id
      project {
        _id
      }
      requirements {
        viewerMeetsTheRequirements @include(if: $isAuthenticated)
        reason
        totalCount
      }
    }
  `,
});
