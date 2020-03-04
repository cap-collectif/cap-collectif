// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { submit, reduxForm, Field, arrayPush, change, formValueSelector } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { renderOptionalLabel } from '../Content/ProjectContentAdminForm';
import toggle from '~/components/Form/Toggle';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';
import ProjectAdminQuestionnaireStepForm from './ProjectAdminQuestionnaireStepForm';
import { FormContainer, DateContainer, CustomCodeArea } from './ProjectAdminStepForm.style';

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
  },
  intl: IntlShape,
  formName: string,
  index?: number,
  timeless: boolean,
|};

export type FormValues = {|
  label: string,
  title: string,
  type: string,
  body: string,
  endAt: ?string,
  startAt: string,
  questionnaire?: string,
|};

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  if (props.step && props.index !== undefined && props.index >= 0) {
    dispatch(
      change(props.formName, `steps[${+props.index}]`, {
        id: props.step.id,
        ...formValues,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        ...formValues,
      }),
    );
  }

  if (props.handleClose) {
    props.handleClose();
  }
};

const validate = ({ type, label, title, startAt, questionnaire }: FormValues) => {
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
      label={renderOptionalLabel('end', intl)}
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
            label={renderOptionalLabel('proposal.body', intl)}
            component={renderComponent}
          />
          <Field
            name="metaDescription"
            type="textarea"
            id="step-metaDescription"
            label={renderOptionalLabel(
              'global.meta.description',
              intl,
              'admin.help.metadescription',
            )}
            component={renderComponent}
          />
          {step.type === 'QuestionnaireStep' && (
            <ProjectAdminQuestionnaireStepForm questionnaire={step.questionnaire} />
          )}
          {/** 
      {step.type === 'SynthesisStep' && <ProjectAdminSynthesisStepForm />}
      {step.type === 'RankingStep' && <ProjectAdminRankingStepForm />}
      {step.type === 'SelectionStep' && <ProjectAdminSelectionStepForm />}
      {step.type === 'CollectStep' && <ProjectAdminCollectStepForm />}
      {step.type === 'ConsultationStep' && <ProjectAdminConsultationStepForm />}
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
              <p>
                <strong>
                  <FormattedMessage id="permalink" /> :
                </strong>{' '}
                <a href={step?.url} target="blank">
                  {step?.url}
                </a>
              </p>
            )}
          </>
          {renderSubSection('global-customization')}
          <CustomCodeArea>
            <Field
              name="customCode"
              type="textarea"
              id="step-customCode"
              rows={4}
              label={renderOptionalLabel('admin.customcode', intl, 'admin.help.customcode')}
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
  },
  timeless: formValueSelector('stepForm')(state, 'timeless') || false,
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: 'stepForm',
  })(ProjectAdminStepForm),
);

export default connect(mapStateToProps)(form);
