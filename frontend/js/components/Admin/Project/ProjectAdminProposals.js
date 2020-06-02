// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import * as S from './ProjectAdminProposals.style';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import type {
  Action,
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  ProposalsStateValues,
  ProposalsStatusValues,
  ProposalsStepValues,
  SortValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import type { Uuid } from '~/types';
import InlineSelect from '~ui/InlineSelect';
import {
  getAllFormattedChoicesForProject,
  getFormattedCollectStepsForProject,
  type StepFilter,
  getDifferenceFilters,
  getWordingEmpty,
  isStatusIndeterminate,
  getCommonStatusIdWithinProposalIds,
  isStepIndeterminate,
  getCommonStepIdWithinProposalIds,
  getStepDisplay,
} from '~/components/Admin/Project/ProjectAdminProposals.utils';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import ClearableInput from '~ui/Form/Input/ClearableInput';
import FilterTag from '~ui/Analysis/FilterTag';
import {
  AnalysisFilterContainer,
  AnalysisPickableListContainer,
  AnalysisProposalListHeaderContainer,
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersList,
} from '~ui/Analysis/common.style';
import AddProposalsToStepsMutation from '~/mutations/AddProposalsToStepsMutation';
import ApplyProposalStatusMutation from '~/mutations/ApplyProposalStatusMutation';
import RemoveProposalsFromStepsMutation from '~/mutations/RemoveProposalsFromStepsMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import ProjectAdminMergeModale from '~/components/Admin/Project/Modale/ProjectAdminMergeModale';
import AnalysisNoProposal from '~/components/Analysis/AnalysisNoProposal/AnalysisNoProposal';
import AnalysisProposalListLoader from '~/components/Analysis/AnalysisProposalListLoader/AnalysisProposalListLoader';
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort';
import AnalysisFilterCategory from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory';
import AnalysisFilterDistrict from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict';
import AnalysisProposal from '~/components/Analysis/AnalysisProposal/AnalysisProposal';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

const STATE_RESTRICTED = ['DRAFT', 'TRASHED'];

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProjectAdminProposals_project,
|};

const assignStepProposals = async (
  stepsAdded: Uuid[],
  stepsRemoved: Uuid[],
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  stepSelected: ProposalsStepValues,
  dispatch: any => void,
) => {
  try {
    dispatch({ type: 'START_LOADING' });

    if (stepsAdded.length > 0) {
      await AddProposalsToStepsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          stepIds: stepsAdded,
        },
        step: stepSelected,
      });
    }

    if (stepsRemoved.length > 0) {
      await RemoveProposalsFromStepsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          stepIds: stepsRemoved,
        },
        step: stepSelected,
      });
    }

    dispatch({ type: 'STOP_LOADING' });
  } catch (e) {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: {
        type: TYPE_ALERT.ERROR,
        content: 'moving.contributions.failed',
      },
    });
  }
};

const assignStatus = async (
  assigneeId: ?Uuid,
  stepSelected: ProposalsStepValues,
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  closeDropdown: () => void,
  dispatch: any => void,
) => {
  try {
    closeDropdown();
    dispatch({ type: 'START_LOADING' });

    await ApplyProposalStatusMutation.commit({
      input: {
        proposalIds: selectedProposalIds,
        statusId: assigneeId,
      },
      step: stepSelected,
    });

    dispatch({ type: 'STOP_LOADING' });
  } catch (e) {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: {
        type: TYPE_ALERT.ERROR,
        content: 'status.update.failed',
      },
    });
  }
};

const ProposalListHeader = ({ project }: $Diff<Props, { relay: * }>) => {
  const [isMergeModaleVisible, setIsMergeModaleVisible] = React.useState(false);
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch } = useProjectAdminProposalsContext();

  const { categories, districts, steps, stepStatuses, filtersOrdered } = React.useMemo(
    () =>
      getAllFormattedChoicesForProject(
        project,
        parameters.filters.step,
        selectedRows,
        parameters.filtersOrdered,
      ),
    [project, parameters.filters.step, selectedRows, parameters.filtersOrdered],
  );
  const intl = useIntl();
  const collectSteps = getFormattedCollectStepsForProject(project);
  const selectedStepId: ProposalsStepValues = parameters.filters.step;
  const selectedStep: ?StepFilter = steps.find(({ id }) => id === selectedStepId);
  const isRestricted = STATE_RESTRICTED.includes(parameters.filters.state);

  const selectedProposals = project.proposals?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(proposal => {
      const proposalId = proposal.id;
      return selectedRows.includes(proposalId);
    });

  /* # ACTION # */
  const [selectionSteps, setSelectionSteps] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  });
  const [selectionStatus, setSelectionStatus] = React.useState(null);

  React.useEffect(() => {
    setSelectionStatus(getCommonStatusIdWithinProposalIds(project, selectedRows));
  }, [project, selectedRows]);

  const renderFilters = (
    <>
      {districts?.length > 0 && (
        <AnalysisFilterDistrict
          districts={districts}
          value={parameters.filters.district}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_DISTRICT_FILTER',
              payload: ((newValue: any): ProposalsDistrictValues),
            });
          }}
        />
      )}

      {categories?.length > 0 && (
        <AnalysisFilterCategory
          categories={categories}
          value={parameters.filters.category}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_CATEGORY_FILTER',
              payload: ((newValue: any): ProposalsCategoryValues),
            });
          }}
        />
      )}

      {stepStatuses?.length > 0 && !isRestricted && (
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
                <DropdownSelect.Choice value="ALL">
                  {intl.formatMessage({ id: 'global.select_statuses' })}
                </DropdownSelect.Choice>
                <DropdownSelect.Choice value="NONE">
                  {intl.formatMessage({ id: 'global.select_propositions-without-status' })}
                </DropdownSelect.Choice>
                {stepStatuses.map(stepStatus => (
                  <DropdownSelect.Choice key={stepStatus.id} value={stepStatus.id}>
                    {stepStatus.name}
                  </DropdownSelect.Choice>
                ))}
              </DropdownSelect>
            </Collapsable.Element>
          </Collapsable>
        </AnalysisFilterContainer>
      )}

      {!isRestricted && (
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
        </AnalysisFilterContainer>
      )}

      <AnalysisFilterSort
        value={parameters.sort}
        onChange={newValue => {
          dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
        }}
      />
    </>
  );

  const renderActions = (
    <React.Fragment>
      {selectedRows.length > 1 && parameters.filters.state === 'PUBLISHED' && (
        <>
          <S.MergeButton onClick={() => setIsMergeModaleVisible(true)} id="merge-button">
            <FormattedMessage id="proposal.add_fusion" />
          </S.MergeButton>
          <S.Divider />
        </>
      )}

      <AnalysisFilterContainer>
        <Collapsable
          align="right"
          onClose={() =>
            assignStepProposals(
              selectionSteps.added,
              selectionSteps.removed,
              selectedRows,
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
              isMultiSelect
              mode="add-remove"
              title={intl.formatMessage({ id: 'move.in.step' })}
              initialValue={getCommonStepIdWithinProposalIds(project, selectedRows)}
              value={selectionSteps}
              onChange={setSelectionSteps}>
              {steps.map(step => (
                <S.ProposalListDropdownChoice
                  key={step.id}
                  value={step.id}
                  isIndeterminate={isStepIndeterminate(project, selectedRows, step.id)}
                  disabled={collectSteps.includes(step.id)}>
                  {step.title}
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
                  value={selectionStatus}
                  onChange={newValue =>
                    assignStatus(newValue, selectedStepId, selectedRows, closeDropdown, dispatch)
                  }
                  title={intl.formatMessage({ id: 'change.status.to' })}>
                  {stepStatuses.length === 0 && (
                    <DropdownSelect.Message>
                      <S.EmptyStatuses>
                        <Icon name={ICON_NAME.warning} size={15} />
                        <div>
                          <FormattedMessage tagName="p" id="no.filter.available" />
                          <FormattedMessage
                            tagName="span"
                            id="help.add.filters"
                            values={{
                              link_to_step: (
                                <a href={project.adminAlphaUrl}>{selectedStep?.title}</a>
                              ),
                            }}
                          />
                        </div>
                      </S.EmptyStatuses>
                    </DropdownSelect.Message>
                  )}
                  {stepStatuses.map(status => (
                    <DropdownSelect.Choice
                      key={status.id}
                      value={status.id}
                      isIndeterminate={isStatusIndeterminate(project, selectedRows, status.id)}>
                      {status.name}
                    </DropdownSelect.Choice>
                  ))}
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
          {renderActions}

          <ProjectAdminMergeModale
            proposalsSelected={selectedProposals}
            onClose={() => setIsMergeModaleVisible(false)}
            show={isMergeModaleVisible}
            dispatch={dispatch}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount} <FormattedMessage id="global.proposals" />
          </p>
          <AnalysisProposalListFiltersContainer>
            <AnalysisProposalListFiltersAction>{renderFilters}</AnalysisProposalListFiltersAction>
            {filtersOrdered.length > 0 && selectedRows.length === 0 && (
              <AnalysisProposalListFiltersList>
                {filtersOrdered.map(({ id, name, action, icon, color }) => (
                  <FilterTag
                    key={id}
                    onClose={action ? () => dispatch((({ type: action }: any): Action)) : null}
                    icon={icon ? <Icon name={ICON_NAME[icon]} size="1rem" color="#fff" /> : null}
                    bgColor={color}>
                    {name}
                  </FilterTag>
                ))}
              </AnalysisProposalListFiltersList>
            )}
          </AnalysisProposalListFiltersContainer>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const ProjectAdminProposals = ({ project, relay }: Props) => {
  const { parameters, dispatch, status } = useProjectAdminProposalsContext();
  const intl = useIntl();
  const hasProposals = project.proposals?.totalCount > 0;
  const hasSelectedFilters = getDifferenceFilters(parameters.filters);
  const hasNoResultWithFilter = !hasProposals && hasSelectedFilters;
  const stepDisplay = React.useMemo(() => getStepDisplay(project, parameters.filters.step), [
    project,
    parameters.filters.step,
  ]);

  const isInteractive =
    parameters.filters.state !== 'ALL' &&
    !STATE_RESTRICTED.includes(parameters.filters.state) &&
    !hasNoResultWithFilter;

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
              <FormattedMessage
                id="filter.count.status.all"
                values={{ num: project.proposalsAll?.totalCount }}
              />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="PUBLISHED">
              <FormattedMessage
                id="filter.count.status.published"
                values={{ num: project.proposalsPublished?.totalCount }}
              />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="DRAFT">
              <FormattedMessage
                id="filter.count.status.draft"
                values={{ num: project.proposalsDraft?.totalCount }}
              />
            </InlineSelect.Choice>
            <InlineSelect.Choice value="TRASHED">
              <FormattedMessage
                id="filter.count.status.trash"
                values={{ num: project.proposalsTrashed?.totalCount }}
              />
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
          loader={<AnalysisProposalListLoader key="loader" />}>
          <AnalysisProposalListHeaderContainer
            isSelectable={isInteractive}
            disabled={!hasProposals && !hasSelectedFilters}>
            <ProposalListHeader project={project} />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasProposals ? (
              project.proposals?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(proposal => (
                  <AnalysisProposal
                    isAdminUrl
                    hasRegroupTag
                    proposal={proposal}
                    key={proposal.id}
                    rowId={proposal.id}
                    dispatch={dispatch}
                    hasStateTag={parameters.filters.state === 'ALL'}>
                    <S.ProposalListRowInformationsStepState>
                      {stepDisplay && (
                        <S.ProposalVotableStep>{stepDisplay.title}</S.ProposalVotableStep>
                      )}

                      <S.Label
                        bsStyle={proposal.status?.color || 'default'}
                        onClick={() =>
                          dispatch({
                            type: 'CHANGE_STATUS_FILTER',
                            payload: ((proposal.status?.id: any): ProposalsStatusValues),
                          })
                        }>
                        {proposal.status?.name ||
                          intl.formatMessage({ id: 'admin.fields.proposal.no_status' })}
                      </S.Label>
                    </S.ProposalListRowInformationsStepState>
                  </AnalysisProposal>
                ))
            ) : (
              <AnalysisNoProposal
                state={hasSelectedFilters ? 'CONTRIBUTION' : parameters.filters.state}>
                <FormattedMessage
                  id={getWordingEmpty(hasSelectedFilters, parameters.filters)}
                  tagName="p"
                />
              </AnalysisNoProposal>
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
        adminAlphaUrl
        steps {
          __typename
          id
          title
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
              hasBeenMerged
              author {
                id
                username
              }
              adminUrl
              publishedAt
              draft
              trashed
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
                  title
                }
              }
              ...AnalysisProposal_proposal
            }
            cursor
          }
        }
        proposalsAll: proposals(state: ALL) {
          totalCount
        }
        proposalsPublished: proposals(state: PUBLISHED) {
          totalCount
        }
        proposalsDraft: proposals(state: DRAFT) {
          totalCount
        }
        proposalsTrashed: proposals(state: TRASHED) {
          totalCount
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
