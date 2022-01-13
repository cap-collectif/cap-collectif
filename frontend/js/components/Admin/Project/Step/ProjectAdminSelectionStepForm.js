// @flow

import React from 'react';
import { Field, FieldArray, arrayPush } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { Button } from 'react-bootstrap';
import component from '~/components/Form/Field';
import toggle from '~/components/Form/Toggle';
import select from '~/components/Form/Select';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import StepStatusesList, { type ProposalStepStatus } from './StepStatusesList';
import type { Dispatch } from '~/types';
import { ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';
import StepVotesFields from './StepVotesFields';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { type FranceConnectAllowedData } from "~/components/Admin/Project/Step/ProjectAdminStepForm";

type Props = {|
  requirements?: Array<Requirement>,
  statuses?: Array<ProposalStepStatus>,
  dispatch: Dispatch,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
  votesMin: ?number,
  votesLimit: ?number,
  votesRanking: boolean,
  stepFormName: string,
  fcAllowedData: FranceConnectAllowedData,
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
  stepFormName,
  votesRanking,
  votesLimit,
  votesMin,
  fcAllowedData,
}: Props) => {
  const intl = useIntl();
  const statusesWithId = statuses?.filter(s => s.id) || [];
  return (
    <>
      <StepVotesFields
        stepFormName={stepFormName}
        votable={votable}
        options={{
          limit: votesLimit,
          min: votesMin,
          ranking: votesRanking,
        }}
        isBudgetEnabled={isBudgetEnabled}
        isTresholdEnabled={isTresholdEnabled}
        isLimitEnabled={isLimitEnabled}
      />
      {renderSubSection('global.proposals')}
      <ProjectSmallFieldsContainer>
        <Flex flex="1" direction="row">
          <Flex ml={2} width="100%" maxWidth="175px">
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
          </Flex>
        </Flex>
        <Flex direction="column" flex="1">
          <Text color="gray.900" fontSize={14} fontWeight={600}>
            <FormattedMessage id="proposal-news-label" />
          </Text>
          <Text color="gray.600" mb={2} mt={1} lineHeight="16px" fontSize={11}>
            <FormattedMessage id="proposal-news-help-text" />
          </Text>
          <Field
            component={component}
            type="checkbox"
            name="allowAuthorsToAddNews"
            id="step-allowAuthorsToAddNews">
            <FormattedMessage id="allow-proposal-news" />
          </Field>
        </Flex>
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
              color: 'PRIMARY',
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
        fcAllowedData={fcAllowedData}
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
      <Field
        type="editor"
        name="requirementsReason"
        id="step-requirementsReason"
        label={<FormattedMessage id="reason-for-collection" />}
        component={component}
      />
    </>
  );
};

export default connect<any, any, _, _, _, _>()(ProjectAdminSelectionStepForm);
