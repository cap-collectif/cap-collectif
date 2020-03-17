// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { submit, reduxForm, Field, arrayPush, change, formValueSelector } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import toggle from '~/components/Form/Toggle';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import { ProjectBoxHeader, PermalinkWrapper } from '../Form/ProjectAdminForm.style';
import ProjectAdminQuestionnaireStepForm from './ProjectAdminQuestionnaireStepForm';
import ProjectAdminConsultationStepForm from './ProjectAdminConsultationStepForm';
import { FormContainer, DateContainer, CustomCodeArea } from './ProjectAdminStepForm.style';
import { createRequirements, type Requirement, formatRequirements } from './StepRequirementsList';
import ProjectAdminSynthesisStepForm from './ProjectAdminSynthesisStepForm';

type Props = {|
  ...ReduxFormFormProps,
  handleClose?: () => {},
  step: {
    id: string,
    label: string,
    title: string,
    type: string,
    startAt: string,
    endAt: ?string,
    body: string,
    isEnabled: boolean,
    timeless?: boolean,
    metaDescription: ?string,
    customCode: ?string,
    questionnaire?: {| value: string, label: string |},
    footer?: ?string,
    url: string,
    requirements?: ?Array<Requirement>,
    requirementsReason?: ?string,
    consultations?: Array<{| value: string, label: string |}>,
  },
  intl: IntlShape,
  formName: string,
  index?: number,
  timeless: boolean,
  requirements?: any,
|};

export type FormValues = {|
  label: string,
  title: string,
  type: string,
  body: string,
  endAt: ?string,
  startAt: string,
  questionnaire?: string,
  consultations?: Array<string>,
  requirements?: Array<Requirement>,
|};

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  const requirements = formValues.requirements ? formatRequirements(formValues.requirements) : [];
  if (props.step && props.index !== undefined && props.index >= 0) {
    dispatch(
      change(props.formName, `steps[${+props.index}]`, {
        id: props.step.id,
        url: props.step.url,
        ...formValues,
        requirements,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        ...formValues,
        requirements,
      }),
    );
  }

  if (props.handleClose) {
    props.handleClose();
  }
};

const validate = ({ type, label, title, startAt, questionnaire, consultations }: FormValues) => {
  const errors = {};

  if (!label || label.length < 2) {
    errors.label = 'global.required';
  }

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!startAt) {
    errors.startAt = 'global.required';
  }

  if (type === 'QuestionnaireStep') {
    if (!questionnaire) errors.questionnaire = 'global.required';
  }

  if (type === 'ConsultationStep') {
    if (!consultations || !consultations.length) errors.consultations = 'global.required';
  }

  return errors;
};

export const renderSubSection = (label: string) => (
  <ProjectBoxHeader>
    <h5>
      <FormattedMessage id={label} />
    </h5>
  </ProjectBoxHeader>
);

const renderDateContainer = (formName: string, intl: IntlShape) => (
  <DateContainer>
    <Field
      id="step-startAt"
      component={renderComponent}
      type="datetime"
      name="startAt"
      formName={formName}
      label={<FormattedMessage id="start" />}
      addonAfter={<i className="cap-calendar-2" />}
    />
    <Field
      id="step-endAt"
      component={renderComponent}
      type="datetime"
      name="endAt"
      formName={formName}
      label={renderLabel('end', intl)}
      addonAfter={<i className="cap-calendar-2" />}
    />
  </DateContainer>
);

export function ProjectAdminStepForm({
  step,
  handleSubmit,
  handleClose,
  form,
  intl,
  formName,
  timeless,
  submitting,
  dispatch,
  requirements,
}: Props) {
  return (
    <>
      <Modal.Body>
        <FormContainer onSubmit={handleSubmit} id={form}>
          {renderSubSection('global.general')}
          <Field
            type="text"
            name="label"
            id="step-label"
            label={<FormattedMessage id="color.main_menu.text" />}
            component={renderComponent}
          />
          <Field
            type="text"
            name="title"
            id="step-title"
            label={<FormattedMessage id="global.title" />}
            component={renderComponent}
          />
          {step.type !== 'PresentationStep' && (
            <>
              {(step.type === 'SelectionStep' ||
                step.type === 'CollectStep' ||
                step.type === 'QuestionnaireStep' ||
                step.type === 'ConsultationStep') && (
                <Field
                  icons
                  component={toggle}
                  name="timeless"
                  id="step-timeless"
                  normalize={val => !!val}
                  label={<FormattedMessage id="admin.fields.step.timeless" />}
                />
              )}
              {!timeless && renderDateContainer(formName, intl)}
            </>
          )}
          <Field
            type="editor"
            name="body"
            id="step-body"
            label={renderLabel('proposal.body', intl)}
            component={renderComponent}
          />
          <Field
            name="metaDescription"
            type="textarea"
            id="step-metaDescription"
            label={renderLabel('global.meta.description', intl, 'admin.help.metadescription')}
            component={renderComponent}
          />
          {step.type === 'QuestionnaireStep' && (
            <ProjectAdminQuestionnaireStepForm questionnaire={step.questionnaire} />
          )}
          {step.type === 'ConsultationStep' && (
            <ProjectAdminConsultationStepForm
              requirements={requirements}
              consultations={step.consultations}
            />
          )}
          {step.type === 'SynthesisStep' && <ProjectAdminSynthesisStepForm />}
          {/** 
      {step.type === 'SelectionStep' && <ProjectAdminSelectionStepForm />}
      {step.type === 'RankingStep' && <ProjectAdminRankingStepForm />}
      
      {step.type === 'CollectStep' && <ProjectAdminCollectStepForm />}
       */}
          {renderSubSection('global.publication')}
          <>
            <Field
              icons
              component={toggle}
              name="isEnabled"
              id="step-isEnabled"
              normalize={val => !!val}
              label={<FormattedMessage id="global.published" />}
            />{' '}
            {step.url && (
              <PermalinkWrapper>
                <strong>
                  <FormattedMessage id="permalink" /> :
                </strong>{' '}
                <a href={step?.url} target="blank">
                  {step?.url}
                </a>
              </PermalinkWrapper>
            )}
          </>
          {renderSubSection('global-customization')}
          <CustomCodeArea>
            <Field
              name="customCode"
              type="textarea"
              id="step-customCode"
              rows={4}
              label={renderLabel('admin.customcode', intl, 'admin.help.customcode')}
              placeholder='<script type="text/javascript"> </script>'
              component={renderComponent}
            />
          </CustomCodeArea>
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          id="step-modal-submit"
          disabled={submitting}
          onClick={() => {
            dispatch(submit(form));
          }}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.save" />
          )}
        </Button>
      </Modal.Footer>
    </>
  );
}

const mapStateToProps = (state: GlobalState, { step }: Props) => ({
  initialValues: {
    // AbstractStep
    type: step?.type ? step.type : null,
    label: step?.label ? step.label : null,
    body: step?.body ? step.body : null,
    title: step?.title ? step.title : null,
    endAt: step?.endAt ? step.endAt : null,
    startAt: step?.startAt ? step.startAt : null,
    isEnabled: step?.isEnabled ? step.isEnabled : true,
    timeless: step?.timeless ? step.timeless : false,
    metaDescription: step?.metaDescription ? step.metaDescription : null,
    customCode: step?.customCode ? step.customCode : null,
    // QuestionnaireStep
    questionnaire: step?.questionnaire || null,
    footer: step?.footer ? step.footer : null,
    // ConsultationStep
    consultations: step?.consultations || [],
    requirements: step ? createRequirements(step) : [],
    requirementsReason: step?.requirementsReason || null,
  },
  timeless: formValueSelector('stepForm')(state, 'timeless') || false,
  requirements: formValueSelector('stepForm')(state, 'requirements') || [],
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: 'stepForm',
  })(ProjectAdminStepForm),
);

export default connect(mapStateToProps)(form);
