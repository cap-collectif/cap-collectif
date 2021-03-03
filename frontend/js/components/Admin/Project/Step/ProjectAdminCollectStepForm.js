// @flow

import React from 'react';
import { Field, FieldArray, arrayPush, change } from 'redux-form';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import environment from '~/createRelayEnvironment';
import component from '~/components/Form/Field';
import select from '~/components/Form/Select';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import StepStatusesList, { type ProposalStepStatus } from './StepStatusesList';
import type { Dispatch } from '~/types';
import { ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';
import { PrivacyInfo } from './ProjectAdminStepForm.style';
import StepVotesFields from './StepVotesFields';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';
import { renderSortValues } from './ProjectAdminSelectionStepForm';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

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
  proposal?: {| label: string, value: string |},
  isPrivate: boolean,
|};

export const getAvailableProposals = graphql`
  query ProjectAdminCollectStepFormProposalsQuery($term: String) {
    availableProposalForms(term: $term) {
      id
      title
      isGridViewEnabled
      isListViewEnabled
      isMapViewEnabled
    }
  }
`;

export const loadProposalOptions = (
  proposal: ?{| label: string, value: string |},
  term: ?string,
) => {
  return fetchQuery(environment, getAvailableProposals, {
    term: term === '' ? null : term,
  }).then(data => {
    const proposals = data.availableProposalForms.map(p => ({
      value: p.id,
      label: p.title,
      isGridViewEnabled: p.isGridViewEnabled,
      isListViewEnabled: p.isListViewEnabled,
      isMapViewEnabled: p.isMapViewEnabled,
    }));

    if (proposal && !proposals.some(q => q.value === proposal.value)) proposals.push(proposal);
    return proposals;
  });
};

const formName = 'stepForm';

export const ProjectAdminCollectStepForm = ({
  votable,
  requirements,
  statuses,
  dispatch,
  isBudgetEnabled,
  isTresholdEnabled,
  isLimitEnabled,
  proposal,
  isPrivate,
  stepFormName,
  votesLimit,
  votesMin,
  votesRanking,
}: Props) => {
  const intl = useIntl();
  const statusesWithId = statuses?.filter(s => s.id) || [];
  return (
    <>
      {renderSubSection('collect_step')}
      <Field
        selectFieldIsObject
        debounce
        autoload
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        component={select}
        name="proposalForm"
        id="step-proposalForm"
        placeholder=" "
        label={<FormattedMessage id="admin.fields.step.proposal_form" />}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        defaultOptions
        cacheOptions
        loadOptions={term => loadProposalOptions(proposal, term)}
        clearable
      />
      {renderSubSection('global.proposals')}
      <ProjectSmallFieldsContainer>
        <Flex flex="1" direction="row">
          <Flex flex="1" direction="row" maxWidth="230px">
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
          <Flex ml={2} width="100%" maxWidth="175px" direction="column">
            <FormattedMessage tagName="b" id="project-visibility" />
            <Flex>
              <DropdownButton
                id="js-btn-visibility-step"
                className="mt-15"
                title={<FormattedMessage id={isPrivate ? 'global-restricted' : 'public'} />}>
                <MenuItem
                  id="public-collect"
                  onClick={() => {
                    dispatch(change(formName, 'private', false));
                  }}>
                  <PrivacyInfo>
                    <FormattedMessage id="public" />
                    <FormattedMessage id="everybody" />
                  </PrivacyInfo>
                </MenuItem>
                <MenuItem
                  id="private-collect"
                  onClick={() => {
                    dispatch(change(formName, 'private', true));
                  }}>
                  <PrivacyInfo>
                    <FormattedMessage id="global-restricted" />
                    <FormattedMessage id="authors-and-administrators" />
                  </PrivacyInfo>
                </MenuItem>
              </DropdownButton>
            </Flex>
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

      {renderSubSection('admin.fields.step.statuses')}
      <FieldArray
        name="statuses"
        component={StepStatusesList}
        formName={formName}
        statuses={statuses}
      />
      <Button
        id="js-btn-create-step"
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

export default connect<any, any, _, _, _, _>()(ProjectAdminCollectStepForm);
