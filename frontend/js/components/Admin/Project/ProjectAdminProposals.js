// @flow
import * as React from 'react';
import moment from 'moment';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import * as S from './ProjectAdminProposals.style';
import Tag from '~ui/Labels/Tag';
import Loader from '~ui/FeedbacksIndicators/Loader';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import type {
  Action,
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  ProposalsStateValues,
  ProposalsStepValues,
  SortValues,
  StepsChangedProposal,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import type { Uuid } from '~/types';
import InlineSelect from '~ui/InlineSelect';
import {
  getAllFormattedChoicesForProject,
  type ProposalsSelected,
  type StepFilter,
  FILLING,
} from '~/components/Admin/Project/ProjectAdminProposals.utils';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import ClearableInput from '~ui/Form/Input/ClearableInput';
import FilterTag from '~ui/Analysis/FilterTag';
import colors from '~/utils/colors';
import {
  AnalysisFilterContainer,
  AnalysisNoContributionIcon,
  AnalysisPickableListContainer,
  AnalysisProposalListHeaderContainer,
  AnalysisProposalListLoader,
  AnalysisProposalListNoContributions,
  AnalysisProposalListRowInformations,
  AnalysisProposalListRowMeta,
} from '~ui/Analysis/common.style';
import AddProposalsToStepsMutation from '~/mutations/AddProposalsToStepsMutation';
import ApplyProposalStatusMutation from '~/mutations/ApplyProposalStatusMutation';
import RemoveProposalsFromStepsMutation from '~/mutations/RemoveProposalsFromStepsMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import type { StepFilling } from '~/components/Admin/Project/ProjectAdminProposals.utils';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProjectAdminProposals_project,
|};

const updateStepProposals = (
  proposalsSelected: $ReadOnlyArray<ProposalsSelected>,
  stepsChangedProposal: StepsChangedProposal,
  stepSelected: ProposalsStepValues,
  dispatch,
) => {
  if (
    stepsChangedProposal.stepsAdded.length === 0 &&
    stepsChangedProposal.stepsRemoved.length === 0
  ) {
    return;
  }

  dispatch({ type: 'START_LOADING' });
  const promises = [];
  const proposalIds = proposalsSelected.map(({ id }) => id);

  if (stepsChangedProposal.stepsAdded.length > 0) {
    const stepIds = stepsChangedProposal.stepsAdded.map(({ id }) => id);

    promises.push(
      AddProposalsToStepsMutation.commit({
        input: {
          proposalIds,
          stepIds,
        },
        step: stepSelected,
      }),
    );
  }

  if (stepsChangedProposal.stepsRemoved.length > 0) {
    const stepIds = stepsChangedProposal.stepsRemoved.map(({ id }) => id);

    promises.push(
      RemoveProposalsFromStepsMutation.commit({
        input: {
          proposalIds,
          stepIds,
        },
        step: stepSelected,
      }),
    );
  }

  return Promise.all(promises)
    .then(() => {
      dispatch({
        type: 'CLEAR_STEPS_CHANGED_PROPOSAL',
      });
      dispatch({ type: 'STOP_LOADING' });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'moving.contributions.failed',
        },
      });
    });
};

const updateStatusProposals = (
  proposalsSelected: $ReadOnlyArray<ProposalsSelected>,
  statusId: Uuid,
  stepSelected: ProposalsStepValues,
  dispatch,
  closeDropdown,
) => {
  dispatch({ type: 'START_LOADING' });
  closeDropdown();

  const proposalIds = proposalsSelected.map(({ id }) => id);
  const shouldDeleteStatus = proposalsSelected.every(({ status }) => status === statusId);

  return ApplyProposalStatusMutation.commit({
    input: {
      proposalIds,
      statusId: shouldDeleteStatus ? null : statusId,
    },
    step: stepSelected,
  })
    .then(() => {
      dispatch({ type: 'STOP_LOADING' });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'status.update.failed',
        },
      });
    });
};

const ProposalListLoader = () => (
  <AnalysisProposalListLoader>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </AnalysisProposalListLoader>
);

const ProposalListHeader = ({ project }: $Diff<Props, { relay: * }>) => {
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch, firstCollectStepId } = useProjectAdminProposalsContext();

  const {
    categories,
    districts,
    steps,
    stepStatuses,
    proposalsSelected,
    stepsFilling,
    statusesFilling,
  } = React.useMemo(
    () =>
      getAllFormattedChoicesForProject(
        project,
        parameters.filters.step,
        parameters.stepsChangedProposal,
        selectedRows,
      ),
    [project, parameters.filters.step, parameters.stepsChangedProposal, selectedRows],
  );
  const intl = useIntl();
  const selectedStepId: ProposalsStepValues = parameters.filters.step;
  const selectedStep: ?StepFilter = steps.find(({ id }) => id === selectedStepId);
  const selectedStepStatus = React.useMemo(
    () => stepStatuses.find(s => s.id === parameters.filters.status),
    [parameters.filters.status, stepStatuses],
  );

  const renderFilters = (
    <React.Fragment>
      {districts?.length > 0 && (
        <AnalysisFilterContainer>
          <Collapsable align="right" key="zone-filter">
            <Collapsable.Button>
              <FormattedMessage tagName="p" id="admin.fields.proposal.map.zone" />
            </Collapsable.Button>
            <Collapsable.Element
              ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
              <DropdownSelect
                shouldOverflow
                value={parameters.filters.district}
                onChange={newValue => {
                  dispatch({
                    type: 'CHANGE_DISTRICT_FILTER',
                    payload: ((newValue: any): ProposalsDistrictValues),
                  });
                }}
                title={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
                <DropdownSelect.Choice value="ALL">
                  {intl.formatMessage({ id: 'global.select_districts' })}
                </DropdownSelect.Choice>
                {districts.map(district => (
                  <DropdownSelect.Choice key={district.id} value={district.id}>
                    {district.name}
                  </DropdownSelect.Choice>
                ))}
              </DropdownSelect>
            </Collapsable.Element>
          </Collapsable>
          <FilterTag
            onClose={() => {
              dispatch({ type: 'CLEAR_DISTRICT_FILTER' });
            }}
            icon={<i className="cap cap-marker-1" />}
            show={parameters.filters.district !== 'ALL'}>
            {districts.find(d => d.id === parameters.filters.district)?.name || null}
          </FilterTag>
        </AnalysisFilterContainer>
      )}

      {categories?.length > 0 && (
        <AnalysisFilterContainer>
          <Collapsable align="right" key="category-filter">
            <Collapsable.Button>
              <FormattedMessage tagName="p" id="admin.fields.proposal.category" />
            </Collapsable.Button>
            <Collapsable.Element
              ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
              <DropdownSelect
                value={parameters.filters.category}
                onChange={newValue => {
                  dispatch({
                    type: 'CHANGE_CATEGORY_FILTER',
                    payload: ((newValue: any): ProposalsCategoryValues),
                  });
                }}
                title={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
                <DropdownSelect.Choice value="ALL">
                  {intl.formatMessage({ id: 'global.select_categories' })}
                </DropdownSelect.Choice>
                {categories.map(cat => (
                  <DropdownSelect.Choice key={cat.id} value={cat.id}>
                    {cat.name}
                  </DropdownSelect.Choice>
                ))}
              </DropdownSelect>
            </Collapsable.Element>
          </Collapsable>
          <FilterTag
            onClose={() => {
              dispatch({ type: 'CLEAR_CATEGORY_FILTER' });
            }}
            icon={<i className="cap cap-tag-1" />}
            show={parameters.filters.category !== 'ALL'}>
            {categories.find(c => c.id === parameters.filters.category)?.name || null}
          </FilterTag>
        </AnalysisFilterContainer>
      )}

      {stepStatuses?.length > 0 && (
        <AnalysisFilterContainer>
          <Collapsable align="right" key="status-filter">
            <Collapsable.Button>
              <FormattedMessage tagName="p" id="admin.fields.proposal.status" />
            </Collapsable.Button>
            <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter-by' })}>
              <DropdownSelect
                value={parameters.filters.status}
                onChange={newValue => {
                  dispatch({
                    type: 'CHANGE_STATUS_FILTER',
                    payload: ((newValue: any): SortValues),
                  });
                }}
                title={intl.formatMessage({ id: 'filter-by' })}>
                {stepStatuses.map(stepStatus => (
                  <DropdownSelect.Choice key={stepStatus.id} value={stepStatus.id}>
                    {stepStatus.name}
                  </DropdownSelect.Choice>
                ))}
              </DropdownSelect>
            </Collapsable.Element>
          </Collapsable>
          <FilterTag
            onClose={() => {
              dispatch({ type: 'CLEAR_STATUS_FILTER' });
            }}
            bgColor={selectedStepStatus?.color || undefined}
            show={parameters.filters.status !== null}>
            {selectedStepStatus?.name || null}
          </FilterTag>
        </AnalysisFilterContainer>
      )}

      <AnalysisFilterContainer>
        <Collapsable align="right" key="step-filter">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="admin.label.step" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter-by' })}>
            <DropdownSelect
              value={parameters.filters.step}
              onChange={newValue => {
                dispatch({ type: 'CHANGE_STEP_FILTER', payload: ((newValue: any): SortValues) });
              }}
              title={intl.formatMessage({ id: 'filter-by' })}>
              {steps.map(s => (
                <DropdownSelect.Choice key={s.id} value={s.id}>
                  {s.title}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
        <FilterTag canClose={false} show={firstCollectStepId !== parameters.filters.step}>
          {steps.find(s => s.id === parameters.filters.step)?.title || null}
        </FilterTag>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right" key="sort-filter">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="argument.sort.label" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'sort-by' })}>
            <DropdownSelect
              value={parameters.sort}
              onChange={newValue => {
                dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
              }}
              title={intl.formatMessage({ id: 'sort-by' })}>
              <DropdownSelect.Choice value="newest">
                {intl.formatMessage({ id: 'global.filter_f_last' })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="oldest">
                {intl.formatMessage({ id: 'global.filter_f_old' })}
              </DropdownSelect.Choice>
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
    </React.Fragment>
  );

  const renderFiltersSelectedProposal = (
    <React.Fragment>
      <AnalysisFilterContainer>
        <Collapsable
          align="right"
          onClose={() =>
            updateStepProposals(
              proposalsSelected,
              parameters.stepsChangedProposal,
              selectedStepId,
              dispatch,
            )
          }>
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="synthesis.edition.action.publish.field.parent" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'synthesis.edition.action.publish.field.parent' })}>
            <DropdownSelect
              shouldOverflow
              title={intl.formatMessage({ id: 'move.in.step' })}
              onChange={(stepFilling: StepFilling) => {
                dispatch(
                  (({
                    type:
                      stepFilling.filling === FILLING.FULL
                        ? 'CHANGE_STEPS_REMOVED_FROM_PROPOSAL'
                        : 'CHANGE_STEPS_ADDED_TO_PROPOSAL',
                    payload: {
                      stepId: stepFilling.id,
                      countSelectedProposal: selectedRows.length,
                    },
                  }: any): Action),
                );
              }}>
              {stepsFilling.map(step => (
                <S.ProposalListDropdownChoice
                  key={step.id}
                  value={{ id: step.id, filling: step.filling }}
                  disabled={step.id === selectedStepId}>
                  {step.icon && <Icon name={step.icon} size={12} color={colors.black} />}
                  <span>{step.title}</span>
                </S.ProposalListDropdownChoice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>

      <AnalysisFilterContainer>
        <Collapsable align="right">
          {closeDropdown => (
            <>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="admin.fields.proposal.status" />
              </Collapsable.Button>
              <Collapsable.Element
                ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.status' })}>
                <DropdownSelect
                  onChange={statusFilling =>
                    updateStatusProposals(
                      proposalsSelected,
                      ((statusFilling: any): Uuid),
                      selectedStepId,
                      dispatch,
                      closeDropdown,
                    )
                  }
                  title={intl.formatMessage({ id: 'change.status.to' })}>
                  {statusesFilling?.length > 0 ? (
                    statusesFilling.map(status => (
                      <S.ProposalListDropdownChoice key={status.id} value={status.id}>
                        {status.icon && <Icon name={status.icon} size={12} color={colors.black} />}
                        <span>{status.name}</span>
                      </S.ProposalListDropdownChoice>
                    ))
                  ) : (
                    <S.EmptyStatusesFilling>
                      <Icon name={ICON_NAME.warning} size={15} />
                      <div>
                        <FormattedMessage tagName="p" id="no.filter.available" />
                        <FormattedMessage
                          tagName="span"
                          id="help.add.filters"
                          values={{
                            link_to_step: <a href={selectedStep?.url}>{selectedStep?.title}</a>,
                          }}
                        />
                      </div>
                    </S.EmptyStatusesFilling>
                  )}
                </DropdownSelect>
              </Collapsable.Element>
            </>
          )}
        </Collapsable>
      </AnalysisFilterContainer>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {selectedRows.length > 0 ? (
        <React.Fragment>
          <FormattedMessage
            id="admin-proposals-list-selected"
            tagName="p"
            values={{
              itemCount: selectedRows.length,
            }}
          />
          {renderFiltersSelectedProposal}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount} <FormattedMessage id="global.proposals" />
          </p>
          {renderFilters}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const ProjectAdminProposals = ({ project, relay }: Props) => {
  const { parameters, dispatch, status } = useProjectAdminProposalsContext();
  const intl = useIntl();
  const hasProposals = project.proposals?.totalCount > 0;

  return (
    <PickableList.Provider>
      <AnalysisPickableListContainer>
        <S.ProjectAdminProposalsHeader>
          <InlineSelect
            value={parameters.filters.state}
            onChange={newValue => {
              dispatch({
                type: 'CHANGE_STATE_FILTER',
                payload: ((newValue: any): ProposalsStateValues),
              });
            }}>
            <InlineSelect.Choice value="ALL">
              <FormattedMessage id="global-all" />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="PUBLISHED">
              <FormattedMessage id="submited_plural" />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="DRAFT">
              <FormattedMessage id="proposal.state.draft" />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="TRASHED">
              <FormattedMessage id="project_download.label.trashed" />
            </InlineSelect.Choice>
          </InlineSelect>
          <ClearableInput
            id="search"
            name="search"
            type="text"
            icon={<i className="cap cap-magnifier" />}
            onClear={() => {
              if (parameters.filters.term !== null) {
                dispatch({ type: 'CLEAR_TERM' });
              }
            }}
            initialValue={parameters.filters.term}
            onSubmit={term => {
              if (term === '' && parameters.filters.term !== null) {
                dispatch({ type: 'CLEAR_TERM' });
              } else if (term !== '' && parameters.filters.term !== term) {
                dispatch({ type: 'SEARCH_TERM', payload: term });
              }
            }}
            placeholder={intl.formatMessage({ id: 'global.menu.search' })}
          />
        </S.ProjectAdminProposalsHeader>

        <PickableList
          isLoading={status === 'loading'}
          useInfiniteScroll={hasProposals}
          onScrollToBottom={() => {
            relay.loadMore(PROJECT_ADMIN_PROPOSAL_PAGINATION);
          }}
          hasMore={project.proposals?.pageInfo.hasNextPage}
          loader={<ProposalListLoader key="loader" />}>
          <AnalysisProposalListHeaderContainer>
            <ProposalListHeader project={project} />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasProposals ? (
              project.proposals?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(proposal => (
                  <S.ProposalListRow key={proposal.id} rowId={proposal.id}>
                    <h2>
                      <a href={proposal.adminUrl}>{proposal.title}</a>
                    </h2>
                    <AnalysisProposalListRowInformations>
                      <p>
                        #{proposal.reference} • {proposal.author.username}
                        {proposal.publishedAt && (
                          <React.Fragment>
                            {' '}
                            • <FormattedMessage id="submited_on" />{' '}
                            <FormattedDate
                              value={moment(proposal.publishedAt)}
                              day="numeric"
                              month="long"
                              year="numeric"
                            />
                          </React.Fragment>
                        )}
                      </p>
                      <S.ProposalListRowInformationsStepState>
                        {proposal.form?.step && (
                          <S.ProposalVotableStepTitle>
                            {proposal.form.step.title}
                          </S.ProposalVotableStepTitle>
                        )}
                        {proposal.status && (
                          <S.Label bsStyle={proposal.status.color}>{proposal.status.name}</S.Label>
                        )}
                      </S.ProposalListRowInformationsStepState>
                    </AnalysisProposalListRowInformations>
                    <AnalysisProposalListRowMeta>
                      {proposal.district && (
                        <Tag size="10px" icon="cap cap-marker-1 ">
                          {proposal.district.name}
                        </Tag>
                      )}
                      {proposal.category && (
                        <Tag size="10px" icon="cap cap-tag-1 ">
                          {proposal.category.name}
                        </Tag>
                      )}
                    </AnalysisProposalListRowMeta>
                  </S.ProposalListRow>
                ))
            ) : (
              <AnalysisProposalListNoContributions>
                <AnalysisNoContributionIcon />
                <FormattedMessage id="global.no_proposals" tagName="p" />
              </AnalysisProposalListNoContributions>
            )}
          </PickableList.Body>
        </PickableList>
      </AnalysisPickableListContainer>
    </PickableList.Provider>
  );
};

export default createPaginationContainer(
  ProjectAdminProposals,
  {
    project: graphql`
      fragment ProjectAdminProposals_project on Project
        @argumentDefinitions(
          projectId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          state: { type: "ProposalsState!", defaultValue: ALL }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          status: { type: "ID", defaultValue: null }
          step: { type: "ID", defaultValue: null }
          term: { type: "String", defaultValue: null }
        ) {
        id
        steps {
          __typename
          id
          title
          url
          ... on ProposalStep {
            statuses {
              id
              name
              color
            }
            form {
              districts {
                id
                name
              }
              categories {
                id
                name
              }
            }
          }
        }
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          state: $state
          category: $category
          district: $district
          status: $status
          step: $step
          term: $term
        )
          @connection(
            key: "ProjectAdminProposals_proposals"
            filters: ["orderBy", "state", "category", "district", "status", "step", "term"]
          ) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              author {
                id
                username
              }
              adminUrl
              publishedAt
              district {
                id
                name
              }
              category {
                id
                name
              }
              reference(full: false)
              id
              title
              status(step: $step) {
                id
                name
                color
              }
              form {
                step {
                  id
                  title
                }
              }
              selections {
                step {
                  id
                }
              }
            }
            cursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * $FlowFixMe
     * */
    getConnectionFromProps(props: Props) {
      return props.project && props.project.proposals;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      };
    },
    query: graphql`
      query ProjectAdminProposalsPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: ProposalOrder!
        $state: ProposalsState!
        $category: ID
        $district: ID
        $status: ID
        $step: ID
        $term: String
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminProposals_project
            @arguments(
              projectId: $projectId
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              state: $state
              category: $category
              district: $district
              status: $status
              step: $step
              term: $term
            )
        }
      }
    `,
  },
);
