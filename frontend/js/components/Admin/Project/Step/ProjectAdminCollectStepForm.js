// @flow

import React from 'react';
import { Field, FieldArray, arrayPush, change } from 'redux-form';
import { connect, useSelector } from 'react-redux';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button as BootstrapButton } from 'react-bootstrap';
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import environment from '~/createRelayEnvironment';
import component from '~/components/Form/Field';
import select from '~/components/Form/Select';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import StepStatusesList, { type ProposalStepStatus } from './StepStatusesList';
import type { Dispatch, GlobalState } from '~/types';
import { ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';
import { PrivacyInfo } from './ProjectAdminStepForm.style';
import StepVotesFields from './StepVotesFields';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';
import { renderSortValues } from './ProjectAdminSelectionStepForm';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { type FranceConnectAllowedData } from '~/components/Admin/Project/Step/ProjectAdminStepForm';
import Menu from '../../../DesignSystem/Menu/Menu';
import { ICON_NAME } from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';

type Props = {|
  requirements?: Array<Requirement>,
  statuses?: Array<ProposalStepStatus>,
  dispatch: Dispatch,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
  isSecretBallotEnabled: boolean,
  votesMin: ?number,
  votesLimit: ?number,
  votesRanking: boolean,
  stepFormName: string,
  proposal?: {| label: string, value: string |},
  isPrivate: boolean,
  fcAllowedData: FranceConnectAllowedData,
|};

export const StepVisibilityDropdown: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  margin-top: 15px;
  background-color: #f4f4f4;
  color: #444;
  border-color: #ddd;
  &:hover {
    color: #444;
    border-color: #ddd;
  }
  & svg {
    color: #444;
  }
`;

export const getAvailableProposals = graphql`
  query ProjectAdminCollectStepFormProposalsQuery(
    $term: String
    $affiliations: [ProposalFormAffiliation!]
  ) {
    viewer {
      proposalForms(query: $term, affiliations: $affiliations, availableOnly: true) {
        edges {
          node {
            id
            title
            isGridViewEnabled
            isListViewEnabled
            isMapViewEnabled
          }
        }
      }
    }
  }
`;

export const loadProposalOptions = (
  proposal: ?{| label: string, value: string |},
  term: ?string,
  isAdmin: boolean,
) => {
  return fetchQuery_DEPRECATED(environment, getAvailableProposals, {
    term: term === '' ? null : term,
    affiliations: isAdmin ? [] : ['OWNER'],
  }).then(data => {
    const proposals = data.viewer.proposalForms.edges.map(p => ({
      value: p.node.id,
      label: p.node.title,
      isGridViewEnabled: p.node.isGridViewEnabled,
      isListViewEnabled: p.node.isListViewEnabled,
      isMapViewEnabled: p.node.isMapViewEnabled,
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
  isSecretBallotEnabled,
  proposal,
  isPrivate,
  stepFormName,
  votesLimit,
  votesMin,
  votesRanking,
  fcAllowedData,
}: Props) => {
  const intl = useIntl();
  const { user } = useSelector((state: GlobalState) => state.user);
  const isAdmin = user ? user.isAdmin : false;
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
        loadOptions={term => loadProposalOptions(proposal, term, isAdmin)}
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
              <Menu placement="bottom-start" id="step_visibility">
                <Menu.Button>
                  <StepVisibilityDropdown
                    id="js-btn-visibility-step"
                    className="dropdown-toggle btn btn-default"
                    rightIcon={ICON_NAME.ARROW_DOWN_O}
                    variant="secondary"
                    variantSize="small">
                    <FormattedMessage id={isPrivate ? 'global-restricted' : 'public'} />
                  </StepVisibilityDropdown>
                </Menu.Button>
                <Menu.List>
                  <Menu.ListItem
                    as="li"
                    style={{ paddingBottom: 0, paddingRight: 0 }}
                    id="public-collect"
                    onClick={() => {
                      dispatch(change(formName, 'private', false));
                    }}>
                    <PrivacyInfo>
                      <FormattedMessage id="public" />
                      <FormattedMessage id="everybody" />
                    </PrivacyInfo>
                  </Menu.ListItem>
                  <Menu.ListItem
                    as="li"
                    style={{ paddingBottom: 0, paddingRight: 0 }}
                    id="private-collect"
                    onClick={() => {
                      dispatch(change(formName, 'private', true));
                    }}>
                    <PrivacyInfo>
                      <FormattedMessage id="global-restricted" />
                      <FormattedMessage id="authors-and-administrators" />
                    </PrivacyInfo>
                  </Menu.ListItem>
                </Menu.List>
              </Menu>
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
        isSecretBallotEnabled={isSecretBallotEnabled}
      />

      {renderSubSection('admin.fields.step.statuses')}
      <FieldArray
        name="statuses"
        component={StepStatusesList}
        formName={formName}
        statuses={statuses}
      />
      <BootstrapButton
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
      </BootstrapButton>
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
      <BootstrapButton
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
      </BootstrapButton>
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
