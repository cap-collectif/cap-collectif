// @flow
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import uniqBy from 'lodash/uniqBy';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import type { GlobalState, Uuid } from '~/types';
import type { User } from '~/redux/modules/user';
import type { AnalysisDashboardHeader_project } from '~relay/AnalysisDashboardHeader_project.graphql';
import { usePickableList } from '~ui/List/PickableList';
import { useAnalysisProposalsContext } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import {
  getAllFormattedChoicesForProject,
  isRowIndeterminate,
  getAllUserAssigned,
  getActionShown,
  getUsersFilteredWithSearch,
  getCommonAnalystIdsWithinProposalIds,
  getCommonSupervisorIdWithinProposalIds,
  getSelectedSupervisorsByProposals,
  getSelectedAnalystsByProposals,
  getSelectedDecisionMakersByProposals,
  getCommonDecisionMakerIdWithinProposalIds,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils';
import Collapsable from '~ui/Collapsable';
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect';
import DropdownSelect from '~ui/DropdownSelect';
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  SortValues,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import { ORDER_BY } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import { TYPE_ACTION } from '~/constants/AnalyseConstants';
import FilterTag from '~ui/Analysis/FilterTag';
import { AnalysisFilterContainer } from '~ui/Analysis/common.style';
import UserSearchDropdownChoice from '~/components/Admin/Project/UserSearchDropdownChoice';
import AssignAnalystsToProposalsMutation from '~/mutations/AssignAnalystsToProposalsMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import RevokeAnalystsToProposalsMutation from '~/mutations/RevokeAnalystsToProposalsMutation';
import AssignSupervisorToProposalsMutation from '~/mutations/AssignSupervisorToProposalsMutation';
import environment from '~/createRelayEnvironment';
import AssignDecisionMakerToProposalsMutation from '~/mutations/AssignDecisionMakerToProposalsMutation';

type Props = {|
  project: AnalysisDashboardHeader_project,
  userConnected: User,
  defaultUsers: $PropertyType<AnalysisIndexPageQueryResponse, 'defaultUsers'>,
|};

const USER_SEARCH_QUERY = graphql`
  query AnalysisDashboardHeader_UserSearchQuery($terms: String!) {
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

const AnalysisDashboardHeader = ({
  project,
  userConnected,
  defaultUsers,
}: $Diff<Props, { relay: * }>) => {
  const intl = useIntl();
  const { proposals: dataProposals } = project;
  const { ANALYST, SUPERVISOR, DECISION_MAKER } = TYPE_ACTION;
  const proposals = dataProposals?.edges?.filter(Boolean).map(edge => edge.node);
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch } = useAnalysisProposalsContext();
  const { categories, districts } = React.useMemo(() => getAllFormattedChoicesForProject(project), [
    project,
  ]);

  const [supervisor, setSupervisor] = React.useState(null);
  const [decisionMaker, setDecisionMaker] = React.useState(null);
  const [analysts, setAnalysts] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  });

  const actionsShown: string[] = getActionShown(selectedRows, userConnected.id, proposals);

  const [usersFiltered, setUsersFiltered] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState<?string>(null);

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

    const allUserAssigned = getAllUserAssigned(project);
    const usersFilteredWithSearch =
      allUserAssigned?.length > 0 ? getUsersFilteredWithSearch(allUserAssigned, searchTerm) : [];

    if (!isEqual(usersFilteredWithSearch, usersFiltered)) {
      setUsersFiltered(usersFilteredWithSearch);
    }
  }, [project, selectedRows, searchTerm, usersFiltered]);

  const renderFilters = (
    <>
      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage id="admin.fields.proposal.map.zone" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
            <DropdownSelect
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
            <FormattedMessage id="admin.fields.proposal.category" />
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
          {categories.find(d => d.id === parameters.filters.category)?.name || null}
        </FilterTag>
      </AnalysisFilterContainer>

      <AnalysisFilterContainer>
        <Collapsable align="right" onClose={() => setSearchTerm(null)}>
          <Collapsable.Button>
            <FormattedMessage id="panel.analysis.subtitle" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.analyst' })}>
            <SearchableDropdownSelect
              isMultiSelect
              shouldOverflow
              searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
              title={intl.formatMessage({ id: 'filter.by.assigned.analyst' })}
              initialValue={parameters.filters.analysts}
              value={parameters.filters.analysts}
              options={usersFiltered}
              noResultsMessage={intl.formatMessage({ id: 'no_result' })}
              onChangeSearch={searchText => setSearchTerm(searchText)}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_ANALYSTS_FILTER',
                  payload: ((newValue: any): Uuid[]),
                });
              }}>
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
        </Collapsable>
      </AnalysisFilterContainer>

      <AnalysisFilterContainer>
        <Collapsable align="right" onClose={() => setSearchTerm(null)}>
          <Collapsable.Button>
            <FormattedMessage id="global.review" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.supervisor' })}>
            <SearchableDropdownSelect
              shouldOverflow
              searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
              title={intl.formatMessage({ id: 'filter.by.assigned.supervisor' })}
              value={parameters.filters.supervisor}
              options={usersFiltered}
              noResultsMessage={intl.formatMessage({ id: 'no_result' })}
              onChangeSearch={searchText => setSearchTerm(searchText)}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_SUPERVISOR_FILTER',
                  payload: ((newValue: any): Uuid),
                });
              }}>
              {users =>
                users.map(user => (
                  <UserSearchDropdownChoice
                    isIndeterminate={isRowIndeterminate(user, project, selectedRows, 'supervisor')}
                    key={user.id}
                    user={user}
                  />
                ))
              }
            </SearchableDropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>

      <AnalysisFilterContainer>
        <Collapsable align="right" onClose={() => setSearchTerm(null)}>
          <Collapsable.Button>
            <FormattedMessage id="global.decision" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'filter.by.assigned.decision-maker' })}>
            <SearchableDropdownSelect
              shouldOverflow
              searchPlaceholder={intl.formatMessage({ id: 'search.user' })}
              title={intl.formatMessage({ id: 'filter.by.assigned.decision-maker' })}
              value={parameters.filters.decisionMaker}
              options={usersFiltered}
              noResultsMessage={intl.formatMessage({ id: 'no_result' })}
              onChangeSearch={searchText => setSearchTerm(searchText)}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_DECISION_MAKER_FILTER',
                  payload: ((newValue: any): Uuid),
                });
              }}>
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
        </Collapsable>
      </AnalysisFilterContainer>

      <AnalysisFilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage id="argument.sort.label" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'sort-by' })}>
            <DropdownSelect
              value={parameters.sort}
              onChange={newValue => {
                dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
              }}
              title={intl.formatMessage({ id: 'sort-by' })}>
              <DropdownSelect.Choice value={ORDER_BY.NEWEST}>
                {intl.formatMessage({ id: 'global.filter_f_last' })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value={ORDER_BY.OLDEST}>
                {intl.formatMessage({ id: 'global.filter_f_old' })}
              </DropdownSelect.Choice>
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </AnalysisFilterContainer>
    </>
  );

  const renderActions = (
    <>
      {actionsShown.includes(ANALYST) && (
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
                      users
                        .filter(user => user.id !== userConnected.id)
                        .map(user => (
                          <UserSearchDropdownChoice
                            isIndeterminate={isRowIndeterminate(
                              user,
                              project,
                              selectedRows,
                              'analyst',
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
      )}

      {actionsShown.includes(SUPERVISOR) && (
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
                      users
                        .filter(user => user.id !== userConnected.id)
                        .map(user => (
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
      )}

      {actionsShown.includes(DECISION_MAKER) && (
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
                      users
                        .filter(user => user.id !== userConnected.id)
                        .map(user => (
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
      )}
    </>
  );

  return (
    <>
      <FormattedMessage
        tagName="p"
        id="count-proposal"
        values={{ num: selectedRows.length > 0 ? selectedRows.length : rowsCount }}
      />

      {selectedRows.length > 0 ? renderActions : renderFilters}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  userConnected: state.user.user,
});

const AnalysisDashboardHeaderConnected = connect(mapStateToProps)(AnalysisDashboardHeader);

export default createFragmentContainer(AnalysisDashboardHeaderConnected, {
  project: graphql`
    fragment AnalysisDashboardHeader_project on Project {
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
      proposals: viewerAssignedProposals {
        edges {
          node {
            id
            analysts {
              id
              username
              ...UserSearchDropdownChoice_user
            }
            supervisor {
              id
              username
              ...UserSearchDropdownChoice_user
            }
            decisionMaker {
              id
              username
              ...UserSearchDropdownChoice_user
            }
            ...AnalysisProposalListRole_proposal
          }
        }
      }
    }
  `,
});
