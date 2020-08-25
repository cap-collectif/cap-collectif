// @flow

import React from 'react';
import { Field, FieldArray, arrayPush, change } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { Button, ToggleButton } from 'react-bootstrap';
import component from '~/components/Form/Field';
import toggle from '~/components/Form/Toggle';
import select from '~/components/Form/Select';
import { renderSubSection } from './ProjectAdminStepForm';
import StepStatusesList, { type Status } from './StepStatusesList';
import type { Dispatch } from '~/types';
import { ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';
import StepVotesFields from './StepVotesFields';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';

type Props = {|
  requirements?: Array<Requirement>,
  statuses?: Array<Status>,
  dispatch: Dispatch,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
|};

export const renderSortValues = (intl: IntlShape) => [
  { label: intl.formatMessage({ id: 'global.random' }), value: 'RANDOM' },
  { label: intl.formatMessage({ id: 'global.filter_f_comments' }), value: 'COMMENTS' },
  { label: intl.formatMessage({ id: 'global.filter_f_last' }), value: 'LAST' },
  { label: intl.formatMessage({ id: 'global.filter_f_old' }), value: 'OLD' },
  { label: intl.formatMessage({ id: 'step.sort.votes' }), value: 'VOTES' },
  { label: intl.formatMessage({ id: 'global.filter_f_least-votes' }), value: 'LEAST_VOTE' },
  { label: intl.formatMessage({ id: 'global.filter_f_cheap' }), value: 'CHEAP' },
  { label: intl.formatMessage({ id: 'global.filter_f_expensive' }), value: 'EXPENSIVE' },
];

const formName = 'stepForm';

export const ProjectAdminSelectionStepForm = ({
  votable,
  requirements,
  statuses,
  dispatch,
  isBudgetEnabled,
  isTresholdEnabled,
  isLimitEnabled,
}: Props) => {
  const intl = useIntl();
  const statusesWithId = statuses?.filter(s => s.id) || [];
  return (
    <>
      <StepVotesFields
        votable={votable}
        isBudgetEnabled={isBudgetEnabled}
        isTresholdEnabled={isTresholdEnabled}
        isLimitEnabled={isLimitEnabled}
      />
      {renderSubSection('global.proposals')}
      <ProjectSmallFieldsContainer>
        <Field
          type="radio-buttons"
          id="step-proposalsHidden"
          name="proposalsHidden"
          label={<FormattedMessage id="global.updated.date" />}
          component={component}>
          <ToggleButton
            id="step_now"
            onClick={() => dispatch(change(formName, 'proposalsHidden', 0))}
            value={0}>
            <FormattedMessage id="global.immediate" />
          </ToggleButton>
          <ToggleButton
            id="step_start"
            value={1}
            onClick={() => dispatch(change(formName, 'proposalsHidden', 1))}>
            <FormattedMessage id="step_start" />
          </ToggleButton>
        </Field>
        <Field
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          component={select}
          name="defaultSort"
          id="step-defaultSort"
          placeholder=" "
          label={<FormattedMessage id="admin.fields.opinion_type.default_filter" />}
          options={renderSortValues(intl)}
          clearable={false}
        />
      </ProjectSmallFieldsContainer>
      <Field
        component={toggle}
        id="step-allowingProgressSteps"
        name="allowingProgressSteps"
        normalize={val => !!val}
        label={<FormattedMessage id="admin.fields.step.allowingProgressSteps" />}
      />
      {renderSubSection('admin.fields.step.statuses')}
      <FieldArray
        name="statuses"
        component={StepStatusesList}
        formName={formName}
        statuses={statuses}
      />
      <Button
        id="js-btn-create-step-status"
        bsStyle="primary"
        className="btn-outline-primary box-content__toolbar mb-20"
        onClick={() =>
          dispatch(
            arrayPush(formName, 'statuses', {
              id: null,
              color: 'primary',
            }),
          )
        }>
        <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
      </Button>
      {statusesWithId?.length ? (
        <Field
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          component={select}
          name="defaultStatus"
          id="step-defaultStatus"
          placeholder=" "
          label={<FormattedMessage id="admin.fields.step.default_status" />}
          options={statusesWithId.map(s => ({ label: s.name, value: s.id }))}
        />
      ) : (
        ''
      )}
      {renderSubSection('requirements')}
      <FieldArray
        name="requirements"
        component={StepRequirementsList}
        formName={formName}
        requirements={requirements}
      />
      <Button
        id="js-btn-create-step"
        bsStyle="primary"
        className="btn-outline-primary box-content__toolbar mb-20"
        onClick={() =>
          dispatch(
            arrayPush(formName, 'requirements', {
              uniqueId: getUId(),
              id: null,
              type: 'CHECKBOX',
            }),
          )
        }>
        <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
      </Button>
    </>
  );
};

export default connect()(ProjectAdminSelectionStepForm);
