// @flow
import * as React from 'react';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import {
  createPaginationContainer,
  fetchQuery,
  graphql,
  type RelayPaginationProp,
} from 'react-relay';
import type { ProjectAdminAnalysis_project } from '~relay/ProjectAdminAnalysis_project.graphql';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import Tag from '~ui/Labels/Tag';
import Loader from '~ui/FeedbacksIndicators/Loader';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  SortValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import {
  getAllFormattedChoicesForProject,
  getCommonAnalystIdsWithinProposalIds,
  getCommonDecisionMakerIdWithinProposalIds,
  getCommonSupervisorIdWithinProposalIds,
  getSelectedAnalystsByProposals,
  getSelectedDecisionMakersByProposals,
  getSelectedSupervisorsByProposals,
  isRowIndeterminate,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils';
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect';
import AssignSupervisorToProposalsMutation from '~/mutations/AssignSupervisorToProposalsMutation';
import UserSearchDropdownChoice from '~/components/Admin/Project/UserSearchDropdownChoice';
import environment from '~/createRelayEnvironment';
import type { ProjectAdminAnalysisTabQueryResponse } from '~relay/ProjectAdminAnalysisTabQuery.graphql';
import AnalysisProposalListRole from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import AnalysisProposalContainer, {
  ProposalInformationsContainer,
} from '~/components/Analysis/AnalysisProposal/AnalysisProposal.style';
import FilterTag from '~ui/Analysis/FilterTag';
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
import AssignAnalystsToProposalsMutation from '~/mutations/AssignAnalystsToProposalsMutation';
import RevokeAnalystsToProposalsMutation from '~/mutations/RevokeAnalystsToProposalsMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import AssignDecisionMakerToProposalsMutation from '~/mutations/AssignDecisionMakerToProposalsMutation';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

const USER_SEARCH_QUERY = graphql`
  query ProjectAdminAnalysis_UserSearchQuery($terms: String!) {
    results: userSearch(displayName: $terms) {
      id
      ...UserSearchDropdownChoice_user
    }
  }
`;

const loadOptions = terms =>
  new Promise(async resolve => {
    const response = await fetchQuery(environment, USER_SEARCH_QUERY, {
      terms,
    });
    resolve(response.results);
  });

type Props = {|
  +relay: RelayPaginationProp,
  +defaultUsers: $PropertyType<ProjectAdminAnalysisTabQueryResponse, 'defaultUsers'>,
  +project: ProjectAdminAnalysis_project,
|};

const ProposalListLoader = () => (
  <AnalysisProposalListLoader>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </AnalysisProposalListLoader>
);

const ProposalListHeader = ({ project, defaultUsers }: $Diff<Props, { relay: * }>) => {
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch } = useProjectAdminProposalsContext();
  const [supervisor, setSupervisor] = React.useState(null);
  const [decisionMaker, setDecisionMaker] = React.useState(null);
  const [analysts, setAnalysts] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  });
  const { categories, districts } = React.useMemo(() => getAllFormattedChoicesForProject(project), [
    project,
  ]);
  const selectedSupervisorsByProposals = React.useMemo(
    () => getSelectedSupervisorsByProposals(project, selectedRows),
    [project, selectedRows],
  );
  const selectedDecisionMakersByProposals = React.useMemo(
    () => getSelectedDecisionMakersByProposals(project, selectedRows),
    [project, selectedRows],
  );
  const selectedAnalystsByProposals = React.useMemo(
    () => getSelectedAnalystsByProposals(project, selectedRows),
    [project, selectedRows],
  );
  React.useEffect(() => {
    setDecisionMaker(getCommonDecisionMakerIdWithinProposalIds(project, selectedRows));
    setSupervisor(getCommonSupervisorIdWithinProposalIds(project, selectedRows));
  }, [project, selectedRows]);
  const intl = useIntl();

  const renderFilters = (
    <React.Fragment>
      <AnalysisFilterContainer>
        <Collapsable align="right">
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
      <AnalysisFilterContainer>
        <Collapsable align="right">
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
      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="admin.fields.proposal.status" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter-by' })}>
            {''}
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="panel.analysis.subtitle" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.analyst' })}>
            {''}
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="global.review" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.supervisor' })}>
            {''}
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="global.decision" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.decision-maker' })}>
            {''}
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right">
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

  const renderActions = (
    <React.Fragment>
      <AnalysisFilterContainer>
        <Collapsable
          align="right"
          key="action-analyst"
          onClose={async () => {
            try {
              dispatch({ type: 'START_LOADING' });
              if (analysts.added.length > 0) {
                const response = await AssignAnalystsToProposalsMutation.commit({
                  input: {
                    analystIds: analysts.added,
                    proposalIds: selectedRows,
                  },
                });
                if (response.assignAnalystsToProposals?.errorCode === 'MAX_ANALYSTS_REACHED') {
                  FluxDispatcher.dispatch({
                    actionType: UPDATE_ALERT,
                    alert: {
                      type: TYPE_ALERT.ERROR,
                      content: 'analyst.maximum.assignment.reached',
                    },
                  });
                }
              }
              if (analysts.removed.length > 0) {
                await RevokeAnalystsToProposalsMutation.commit({
                  input: {
                    analystIds: analysts.removed,
                    proposalIds: selectedRows,
                  },
                });
              }

              dispatch({ type: 'STOP_LOADING' });
            } catch (e) {
              FluxDispatcher.dispatch({
                actionType: UPDATE_ALERT,
                alert: {
                  type: TYPE_ALERT.ERROR,
                  content: 'global.error.server.form',
                },
              });
              dispatch({ type: 'STOP_LOADING' });
              // eslint-disable-next-line no-console
              console.error(e);
            }
          }}>
          {closeDropdown => (
            <React.Fragment>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="panel.analysis.subtitle" />
              </Collapsable.Button>
              <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'assign-analyst' })}>
                <SearchableDropdownSelect
                  searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
                  shouldOverflow
                  mode="add-remove"
                  isMultiSelect
                  initialValue={getCommonAnalystIdsWithinProposalIds(project, selectedRows)}
                  value={analysts}
                  onChange={setAnalysts}
                  noResultsMessage={intl.formatMessage({ id: 'no_result' })}
                  clearChoice={{
                    enabled: true,
                    message: intl.formatMessage({ id: 'assigned.to.nobody' }),
                    onClear: async () => {
                      try {
                        closeDropdown();
                        dispatch({ type: 'START_LOADING' });
                        await RevokeAnalystsToProposalsMutation.commit({
                          input: {
                            proposalIds: selectedRows,
                            analystIds: analysts.all,
                          },
                        });
                        dispatch({ type: 'STOP_LOADING' });
                      } catch (e) {
                        FluxDispatcher.dispatch({
                          actionType: UPDATE_ALERT,
                          alert: {
                            type: TYPE_ALERT.ERROR,
                            content: 'global.error.server.form',
                          },
                        });
                        dispatch({ type: 'STOP_LOADING' });
                        // eslint-disable-next-line no-console
                        console.error(e);
                      }
                    },
                  }}
                  title={intl.formatMessage({ id: 'assign-analyst' })}
                  defaultOptions={uniqBy(
                    [
                      ...selectedAnalystsByProposals,
                      ...(defaultUsers?.edges?.filter(Boolean).map(e => e.node) || []),
                    ],
                    'id',
                  )}
                  loadOptions={loadOptions}>
                  {users =>
                    users.map(user => (
                      <UserSearchDropdownChoice
                        isIndeterminate={isRowIndeterminate(user, project, selectedRows, 'analyst')}
                        key={user.id}
                        user={user}
                      />
                    ))
                  }
                </SearchableDropdownSelect>
              </Collapsable.Element>
            </React.Fragment>
          )}
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right" key="action-supervisor">
          {closeDropdown => (
            <React.Fragment>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="global.review" />
              </Collapsable.Button>
              <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'assign-supervisor' })}>
                <SearchableDropdownSelect
                  searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
                  shouldOverflow
                  value={supervisor}
                  onChange={async assigneeId => {
                    if (assigneeId === supervisor) return;
                    closeDropdown();
                    dispatch({ type: 'START_LOADING' });
                    await AssignSupervisorToProposalsMutation.commit({
                      input: {
                        proposalIds: selectedRows,
                        supervisorId: ((assigneeId: any): string),
                      },
                    });
                    dispatch({ type: 'STOP_LOADING' });
                  }}
                  noResultsMessage={intl.formatMessage({ id: 'no_result' })}
                  clearChoice={{
                    enabled: true,
                    message: intl.formatMessage({ id: 'assigned.to.nobody' }),
                    onClear: async () => {
                      closeDropdown();
                      dispatch({ type: 'START_LOADING' });
                      await AssignSupervisorToProposalsMutation.commit({
                        input: {
                          proposalIds: selectedRows,
                          supervisorId: null,
                        },
                      });
                      dispatch({ type: 'STOP_LOADING' });
                    },
                  }}
                  title={intl.formatMessage({ id: 'assign-supervisor' })}
                  defaultOptions={uniqBy(
                    [
                      ...selectedSupervisorsByProposals,
                      ...(defaultUsers?.edges?.filter(Boolean).map(e => e.node) || []),
                    ],
                    'id',
                  )}
                  loadOptions={loadOptions}>
                  {users =>
                    users.map(user => (
                      <UserSearchDropdownChoice
                        isIndeterminate={isRowIndeterminate(
                          user,
                          project,
                          selectedRows,
                          'supervisor',
                        )}
                        key={user.id}
                        user={user}
                      />
                    ))
                  }
                </SearchableDropdownSelect>
              </Collapsable.Element>
            </React.Fragment>
          )}
        </Collapsable>
      </AnalysisFilterContainer>
      <AnalysisFilterContainer>
        <Collapsable align="right" key="action-decision-maker">
          {closeDropdown => (
            <React.Fragment>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="global.decision" />
              </Collapsable.Button>
              <Collapsable.Element
                ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.decision-maker' })}>
                <SearchableDropdownSelect
                  searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
                  shouldOverflow
                  value={decisionMaker}
                  onChange={async assigneeId => {
                    try {
                      if (assigneeId === decisionMaker) return;
                      closeDropdown();
                      dispatch({ type: 'START_LOADING' });
                      await AssignDecisionMakerToProposalsMutation.commit({
                        input: {
                          proposalIds: selectedRows,
                          decisionMakerId: ((assigneeId: any): string),
                        },
                      });
                      dispatch({ type: 'STOP_LOADING' });
                    } catch (e) {
                      FluxDispatcher.dispatch({
                        actionType: UPDATE_ALERT,
                        alert: {
                          type: TYPE_ALERT.ERROR,
                          content: 'global.error.server.form',
                        },
                      });
                      // eslint-disable-next-line no-console
                      console.error(e);
                    }
                  }}
                  noResultsMessage={intl.formatMessage({ id: 'no_result' })}
                  clearChoice={{
                    enabled: true,
                    message: intl.formatMessage({ id: 'assigned.to.nobody' }),
                    onClear: async () => {
                      try {
                        closeDropdown();
                        dispatch({ type: 'START_LOADING' });
                        await AssignDecisionMakerToProposalsMutation.commit({
                          input: {
                            proposalIds: selectedRows,
                            decisionMakerId: null,
                          },
                        });
                        dispatch({ type: 'STOP_LOADING' });
                      } catch (e) {
                        FluxDispatcher.dispatch({
                          actionType: UPDATE_ALERT,
                          alert: {
                            type: TYPE_ALERT.ERROR,
                            content: 'global.error.server.form',
                          },
                        });
                        // eslint-disable-next-line no-console
                        console.error(e);
                      }
                    },
                  }}
                  title={intl.formatMessage({ id: 'assign-decision-maker' })}
                  defaultOptions={uniqBy(
                    [
                      ...selectedDecisionMakersByProposals,
                      ...(defaultUsers?.edges?.filter(Boolean).map(e => e.node) || []),
                    ],
                    'id',
                  )}
                  loadOptions={loadOptions}>
                  {users =>
                    users.map(user => (
                      <UserSearchDropdownChoice
                        isIndeterminate={isRowIndeterminate(
                          user,
                          project,
                          selectedRows,
                          'decision-maker',
                        )}
                        key={user.id}
                        user={user}
                      />
                    ))
                  }
                </SearchableDropdownSelect>
              </Collapsable.Element>
            </React.Fragment>
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

export const ProjectAdminAnalysis = ({ project, defaultUsers, relay }: Props) => {
  const { status } = useProjectAdminProposalsContext();
  const { hasAnyRowsChecked } = usePickableList();
  const hasProposals =
    !!project.firstAnalysisStep?.proposals?.totalCount &&
    project.firstAnalysisStep?.proposals?.totalCount > 0;

  return (
    <AnalysisPickableListContainer>
      <PickableList
        isLoading={status === 'loading'}
        useInfiniteScroll={hasProposals}
        onScrollToBottom={() => {
          relay.loadMore(PROJECT_ADMIN_PROPOSAL_PAGINATION);
        }}
        hasMore={project.firstAnalysisStep?.proposals?.pageInfo.hasNextPage}
        loader={<ProposalListLoader key="loader" />}>
        <AnalysisProposalListHeaderContainer>
          <ProposalListHeader project={project} defaultUsers={defaultUsers} />
        </AnalysisProposalListHeaderContainer>
        <PickableList.Body>
          {hasProposals ? (
            project.firstAnalysisStep?.proposals?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(proposal => (
                <AnalysisProposalContainer
                  hasSelection={hasAnyRowsChecked}
                  key={proposal.id}
                  rowId={proposal.id}>
                  <ProposalInformationsContainer>
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
                  </ProposalInformationsContainer>
                  <AnalysisProposalListRole proposal={proposal} />
                </AnalysisProposalContainer>
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
  );
};

export default createPaginationContainer(
  ProjectAdminAnalysis,
  {
    project: graphql`
      fragment ProjectAdminAnalysis_project on Project
        @argumentDefinitions(
          projectId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          status: { type: "ID", defaultValue: null }
          term: { type: "String", defaultValue: null }
        ) {
        id
        steps {
          __typename
          ... on ProposalStep {
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
        firstAnalysisStep {
          proposals(
            first: $count
            after: $cursor
            orderBy: $orderBy
            category: $category
            district: $district
            term: $term
          )
            @connection(
              key: "ProjectAdminAnalysis_proposals"
              filters: ["orderBy", "category", "district", "term"]
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
                ...AnalysisProposalListRole_proposal
                supervisor {
                  id
                  ...UserSearchDropdownChoice_user
                }
                decisionMaker {
                  id
                  ...UserSearchDropdownChoice_user
                }
                analysts {
                  id
                  ...UserSearchDropdownChoice_user
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
              }
              cursor
            }
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
      return (
        props.project &&
        props.project.firstAnalysisStep &&
        props.project.firstAnalysisStep.proposals
      );
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
      query ProjectAdminAnalysisPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: ProposalOrder!
        $category: ID
        $district: ID
        $term: String
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminAnalysis_project
            @arguments(
              projectId: $projectId
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              category: $category
              district: $district
              term: $term
            )
        }
      }
    `,
  },
);
