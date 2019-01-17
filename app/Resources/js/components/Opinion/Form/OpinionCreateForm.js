// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Alert, Panel, Label } from 'react-bootstrap';
import { reduxForm, Field, clearSubmitErrors, SubmissionError, type FormProps } from 'redux-form';
import Fetcher, { json } from '../../../services/Fetcher';
import renderInput from '../../Form/Field';
import { closeOpinionCreateModal } from '../../../redux/modules/opinion';
import type { Dispatch } from '../../../types';
import type { OpinionCreateForm_section } from './__generated__/OpinionCreateForm_section.graphql';
import type { OpinionCreateForm_consultation } from './__generated__/OpinionCreateForm_consultation.graphql';
import RequirementsForm from '../../Requirements/RequirementsForm';

type RelayProps = {|
  section: OpinionCreateForm_section,
  consultation: OpinionCreateForm_consultation,
|};
type FormValues = Object;
type Props = {|
  ...FormProps,
  ...RelayProps,
|};

export const formName = 'opinion-create-form';
const onSubmit = (data: FormValues, dispatch: Dispatch, props: Props) => {
  const { section, consultation } = props;
  const appendices = section.appendixTypes
    ? section.appendixTypes
        .filter(Boolean)
        .filter(type => data[type.title] && data[type.title].length > 0)
        .map(type => ({ appendixType: type.id, body: data[type.title] }))
    : [];
  const form = {
    title: data.title,
    body: data.body,
    appendices,
  };
  return Fetcher.post(
    `/projects/${consultation.project.id}/steps/${consultation.id}/opinion_types/${
      section.id
    }/opinions`,
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
    const { consultation } = this.props;

    return (
      <Panel id="required-conditions" bsStyle="primary">
        <Panel.Heading>
          <FormattedMessage id="requirements" />{' '}
          {consultation.requirements.viewerMeetsTheRequirements && (
            <Label bsStyle="primary">
              <FormattedMessage id="filled" />
            </Label>
          )}
        </Panel.Heading>
        {!consultation.requirements.viewerMeetsTheRequirements && (
          <Panel.Body>
            <p>{consultation.requirements.reason}</p>
            <RequirementsForm step={consultation} />
          </Panel.Body>
        )}
      </Panel>
    );
  }

  render() {
    const { section, consultation, handleSubmit, error, dispatch } = this.props;
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
        {consultation.requirements.totalCount > 0 && this.renderRequirements()}
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
          section.appendixTypes
            .filter(Boolean)
            .map((field, index) => (
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
      }
    }
  `,
  consultation: graphql`
    fragment OpinionCreateForm_consultation on Consultation
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...RequirementsForm_step
      id
      titleHelpText
      descriptionHelpText
      project {
        id
      }
      requirements {
        viewerMeetsTheRequirements @include(if: $isAuthenticated)
        reason
        totalCount
      }
    }
  `,
});
