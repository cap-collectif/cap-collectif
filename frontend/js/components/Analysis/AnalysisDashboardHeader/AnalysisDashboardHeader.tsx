import { $PropertyType, $Diff } from 'utility-types'
import * as React from 'react'
import { createPaginationContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import type { GlobalState, Uuid } from '~/types'
import type { User } from '~/redux/modules/user'
import type { AnalysisDashboardHeader_project } from '~relay/AnalysisDashboardHeader_project.graphql'
import type { AnalysisDashboardHeader_themes } from '~relay/AnalysisDashboardHeader_themes.graphql'
import { usePickableList } from '~ui/List/PickableList/usePickableList'
import { useAnalysisProposalsContext } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context'
import {
  getAllFormattedChoicesForProject,
  isRowIndeterminate,
  getAllUserAssigned,
  getActionShown,
  getCommonAnalystIdsWithinProposalIds,
  getCommonSupervisorIdWithinProposalIds,
  getSelectedSupervisorsByProposals,
  getSelectedAnalystsByProposals,
  isOnlyAnalyst,
  getRoleUser,
  getUsersWithAnalyseBegin,
  formatDefaultUsers,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils'
import Collapsable from '~ui/Collapsable'
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect'
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  ProposalsThemeValues,
  SortValues,
  Action,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer'
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql'
import { TYPE_ACTION, TYPE_ROLE } from '~/constants/AnalyseConstants'
import FilterTag from '~ui/Analysis/FilterTag'
import {
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersList,
} from '~ui/Analysis/common.style'
import UserSearchDropdownChoice from '~/components/Admin/Project/UserSearchDropdownChoice'
import AssignAnalystsToProposalsMutation from '~/mutations/AssignAnalystsToProposalsMutation'
import FluxDispatcher from '~/dispatchers/AppDispatcher'
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants'
import RevokeAnalystsToProposalsMutation from '~/mutations/RevokeAnalystsToProposalsMutation'
import AssignSupervisorToProposalsMutation from '~/mutations/AssignSupervisorToProposalsMutation'
import environment from '~/createRelayEnvironment'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import AnalysisFilterDistrict from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict'
import AnalysisFilterCategory from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory'
import AnalysisFilterRole from '~/components/Analysis/AnalysisFilter/AnalysisFilterRole'
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort'
import type { Analyst, Supervisor } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils'
import AnalysisFilterTheme from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme'
import type { ThemeFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme'
type Props = {
  readonly project: AnalysisDashboardHeader_project
  readonly themes: AnalysisDashboardHeader_themes
  readonly userConnected: User
  readonly defaultUsers: $PropertyType<AnalysisIndexPageQueryResponse, 'defaultUsers'>
}
const USER_SEARCH_QUERY = graphql`
  query AnalysisDashboardHeader_UserSearchQuery($terms: String!) {
    results: userSearch(displayName: $terms) {
      id
      username
      ...UserSearchDropdownChoice_user
    }
  }
`
export const loadOptions = (terms: string): Promise<ReadonlyArray<any>> =>
  new Promise(async resolve => {
    const response = await fetchQuery_DEPRECATED(environment, USER_SEARCH_QUERY, {
      terms,
    })
    resolve(response.results)
  })

const assignAnalysts = async (
  analystsAdded: Uuid[],
  analystsRemoved: Uuid[],
  selectedProposalIds: ReadonlyArray<Uuid>,
  analystWithAnalyseBegin: ReadonlyArray<Analyst>,
  dispatch: (arg0: any) => void,
) => {
  try {
    dispatch({
      type: 'START_LOADING',
    })

    if (analystsAdded.length > 0) {
      const response = await AssignAnalystsToProposalsMutation.commit({
        input: {
          analystIds: analystsAdded,
          proposalIds: selectedProposalIds,
        },
      })

      if (response.assignAnalystsToProposals?.errorCode === 'MAX_ANALYSTS_REACHED') {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'analyst.maximum.assignment.reached',
          },
        })
      }
    }

    if (analystsRemoved.length > 0) {
      await RevokeAnalystsToProposalsMutation.commit({
        input: {
          analystIds: analystsRemoved,
          proposalIds: selectedProposalIds,
        },
      })
    }

    dispatch({
      type: 'STOP_LOADING',
    })
  } catch (e) {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: {
        type: TYPE_ALERT.ERROR,
        content: 'global.error.server.form',
      },
    })
    dispatch({
      type: 'STOP_LOADING',
    })
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

const assignSupervisor = async (
  assigneeId: Uuid | null | undefined,
  supervisor: Uuid | null | undefined,
  supervisorsWithAnalyseBegin: ReadonlyArray<Supervisor>,
  selectedProposalIds: ReadonlyArray<Uuid>,
  closeDropdown: () => void,
  dispatch: (arg0: any) => void,
) => {
  try {
    closeDropdown()
    dispatch({
      type: 'START_LOADING',
    })
    await AssignSupervisorToProposalsMutation.commit({
      input: {
        proposalIds: selectedProposalIds,
        supervisorId: assigneeId as any as string | null | undefined,
      },
    })
    dispatch({
      type: 'STOP_LOADING',
    })
  } catch (e) {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: {
        type: TYPE_ALERT.ERROR,
        content: 'global.error.server.form',
      },
    })
    dispatch({
      type: 'STOP_LOADING',
    })
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

const AnalysisDashboardHeader = ({
  project,
  themes,
  userConnected,
  defaultUsers,
}: $Diff<
  Props,
  {
    relay: any
  }
>) => {
  const intl = useIntl()
  const allUserAssigned = React.useMemo(() => getAllUserAssigned(project), [project])
  const { ANALYST, SUPERVISOR, DECISION_MAKER } = TYPE_ACTION
  const { selectedRows, rowsCount } = usePickableList()
  const { parameters, dispatch } = useAnalysisProposalsContext()
  const { categories, districts, filtersOrdered } = React.useMemo(
    () => getAllFormattedChoicesForProject(project, parameters.filtersOrdered, intl, themes),
    [project, parameters.filtersOrdered, intl, themes],
  )
  const [supervisor, setSupervisor] = React.useState(null)
  const [analysts, setAnalysts] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  })
  const roleUserConnected = getRoleUser(project, selectedRows, userConnected.id)
  const actionsShown: string[] = getActionShown(roleUserConnected, userConnected.id, selectedRows)
  const { analysts: analystsWithAnalyseBegin, supervisors: supervisorsWithAnalyseBegin } = getUsersWithAnalyseBegin(
    project,
    selectedRows,
  )
  const selectedSupervisorsByProposals = React.useMemo(
    () => getSelectedSupervisorsByProposals(project, selectedRows),
    [project, selectedRows],
  )
  const selectedAnalystsByProposals = React.useMemo(
    () => getSelectedAnalystsByProposals(project, selectedRows),
    [project, selectedRows],
  )
  const areOpinions: boolean = project.firstCollectStep?.form?.objectType === 'OPINION'
  React.useEffect(() => {
    setSupervisor(getCommonSupervisorIdWithinProposalIds(project, selectedRows))
  }, [project, selectedRows])
  const renderFilters = (
    <>
      {districts?.length > 0 && (
        <AnalysisFilterDistrict
          districts={districts}
          value={parameters.filters.district}
          onChange={newValue =>
            dispatch({
              type: 'CHANGE_DISTRICT_FILTER',
              payload: newValue as any as ProposalsDistrictValues,
            })
          }
        />
      )}

      {themes?.length > 0 && (
        <AnalysisFilterTheme
          themes={themes as any as ReadonlyArray<ThemeFilter>}
          value={parameters.filters.theme}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_THEME_FILTER',
              payload: newValue as any as ProposalsThemeValues,
            })
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
              payload: newValue as any as ProposalsCategoryValues,
            })
          }}
        />
      )}

      <AnalysisFilterRole
        isMultiSelect
        type={ANALYST}
        title="panel.analysis.subtitle"
        titleFilter="filter.by.assigned.analyst"
        value={parameters.filters.analysts}
        allUserAssigned={allUserAssigned.analysts}
        reset={{
          enabled: true,
          disabled: parameters.filters.analysts.length === 0,
          message: intl.formatMessage({
            id: 'reset.analysis.filter',
          }),
          onReset: () =>
            dispatch({
              type: 'CHANGE_ANALYSTS_FILTER',
              payload: [],
            }),
        }}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_ANALYSTS_FILTER',
            payload: newValue as any as Uuid[],
          })
        }
      />

      <AnalysisFilterRole
        type={SUPERVISOR}
        title="global.review"
        titleFilter="filter.by.assigned.supervisor"
        value={parameters.filters.supervisor}
        allUserAssigned={allUserAssigned.supervisors}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_SUPERVISOR_FILTER',
            payload: newValue as any as Uuid,
          })
        }
      />

      <AnalysisFilterRole
        type={DECISION_MAKER}
        title="global.decision"
        titleFilter="filter.by.assigned.decision-maker"
        value={parameters.filters.decisionMaker}
        allUserAssigned={allUserAssigned.decisionMakers}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_DECISION_MAKER_FILTER',
            payload: newValue as any as Uuid,
          })
        }
      />

      <AnalysisFilterSort
        hasRevisions
        value={parameters.sort}
        onChange={newValue => {
          dispatch({
            type: 'CHANGE_SORT',
            payload: newValue as any as SortValues,
          })
        }}
      />
    </>
  )
  const renderActions = (
    <>
      {actionsShown.includes(ANALYST) && (
        <Collapsable
          align="right"
          key="action-analyst"
          onClose={() =>
            assignAnalysts(analysts.added, analysts.removed, selectedRows, analystsWithAnalyseBegin, dispatch)
          }
        >
          {({ closeDropdown }) => (
            <React.Fragment>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="panel.analysis.subtitle" />
              </Collapsable.Button>
              <Collapsable.Element
                ariaLabel={intl.formatMessage({
                  id: 'assign-up-to-10-analyst',
                })}
              >
                <SearchableDropdownSelect
                  disabled={analystsWithAnalyseBegin.length === 10}
                  searchPlaceholder={intl.formatMessage({
                    id: 'search.user',
                  })}
                  shouldOverflow
                  mode="add-remove"
                  isMultiSelect
                  initialValue={getCommonAnalystIdsWithinProposalIds(project, selectedRows)}
                  value={analysts}
                  onChange={setAnalysts}
                  noResultsMessage={intl.formatMessage({
                    id: 'no_result',
                  })}
                  clearChoice={{
                    enabled: !isOnlyAnalyst(roleUserConnected) && analystsWithAnalyseBegin.length === 0,
                    message: intl.formatMessage({
                      id: 'assigned.to.nobody',
                    }),
                    onClear: async () => {
                      try {
                        closeDropdown()
                        dispatch({
                          type: 'START_LOADING',
                        })
                        await RevokeAnalystsToProposalsMutation.commit({
                          input: {
                            proposalIds: selectedRows,
                            analystIds: analysts.all,
                          },
                        })
                        dispatch({
                          type: 'STOP_LOADING',
                        })
                      } catch (e) {
                        FluxDispatcher.dispatch({
                          actionType: UPDATE_ALERT,
                          alert: {
                            type: TYPE_ALERT.ERROR,
                            content: 'global.error.server.form',
                          },
                        })
                        // eslint-disable-next-line no-console
                        console.error(e)
                      }
                    },
                  }}
                  title={intl.formatMessage({
                    id: 'assign-up-to-10-analyst',
                  })}
                  defaultOptions={formatDefaultUsers(defaultUsers, selectedAnalystsByProposals)}
                  loadOptions={loadOptions}
                >
                  {users =>
                    users.map(user => (
                      <UserSearchDropdownChoice
                        key={user.id}
                        type={TYPE_ROLE.ANALYST}
                        isIndeterminate={isRowIndeterminate(user, project, selectedRows, 'analyst')}
                        user={user}
                        disabled={
                          (analystsWithAnalyseBegin.some(a => a.id === user.id) &&
                            !isRowIndeterminate(user, project, selectedRows, 'analyst')) ||
                          userConnected.id === user.id
                        }
                      />
                    ))
                  }
                </SearchableDropdownSelect>
              </Collapsable.Element>
            </React.Fragment>
          )}
        </Collapsable>
      )}

      {actionsShown.includes(SUPERVISOR) && (
        <Collapsable align="right" key="action-supervisor">
          {({ closeDropdown }) => (
            <React.Fragment>
              <Collapsable.Button>
                <FormattedMessage tagName="p" id="global.review" />
              </Collapsable.Button>
              <Collapsable.Element
                ariaLabel={intl.formatMessage({
                  id: 'assign-supervisor',
                })}
              >
                <SearchableDropdownSelect
                  disabled={supervisorsWithAnalyseBegin.length > 0}
                  shouldOverflow
                  searchPlaceholder={intl.formatMessage({
                    id: 'search.user',
                  })}
                  value={supervisor}
                  onChange={assigneeId =>
                    assignSupervisor(
                      assigneeId,
                      supervisor,
                      supervisorsWithAnalyseBegin,
                      selectedRows,
                      closeDropdown,
                      dispatch,
                    )
                  }
                  noResultsMessage={intl.formatMessage({
                    id: 'no_result',
                  })}
                  clearChoice={{
                    enabled: supervisorsWithAnalyseBegin.length === 0,
                    message: intl.formatMessage({
                      id: 'assigned.to.nobody',
                    }),
                    onClear: async () => {
                      closeDropdown()
                      dispatch({
                        type: 'START_LOADING',
                      })
                      await AssignSupervisorToProposalsMutation.commit({
                        input: {
                          proposalIds: selectedRows,
                          supervisorId: null,
                        },
                      })
                      dispatch({
                        type: 'STOP_LOADING',
                      })
                    },
                  }}
                  title={intl.formatMessage({
                    id: 'assign-supervisor',
                  })}
                  defaultOptions={formatDefaultUsers(defaultUsers, selectedSupervisorsByProposals)}
                  loadOptions={loadOptions}
                >
                  {users =>
                    users.map(user => (
                      <UserSearchDropdownChoice
                        key={user.id}
                        type={TYPE_ROLE.SUPERVISOR}
                        isIndeterminate={isRowIndeterminate(user, project, selectedRows, 'supervisor')}
                        user={user}
                        disabled={
                          (supervisorsWithAnalyseBegin.some(s => s.id === user.id) &&
                            !isRowIndeterminate(user, project, selectedRows, 'supervisor')) ||
                          userConnected.id === user.id
                        }
                      />
                    ))
                  }
                </SearchableDropdownSelect>
              </Collapsable.Element>
            </React.Fragment>
          )}
        </Collapsable>
      )}
    </>
  )
  return (
    <>
      <FormattedMessage
        tagName="p"
        id={areOpinions ? 'opinion.count' : 'count-proposal'}
        values={{
          num: selectedRows.length > 0 ? selectedRows.length : rowsCount,
          count: selectedRows.length > 0 ? selectedRows.length : rowsCount,
        }}
      />

      <AnalysisProposalListFiltersContainer>
        <AnalysisProposalListFiltersAction>
          {selectedRows.length > 0 ? renderActions : renderFilters}
        </AnalysisProposalListFiltersAction>

        {filtersOrdered.length > 0 && selectedRows.length === 0 && (
          <AnalysisProposalListFiltersList>
            {filtersOrdered.map(({ id, name, action, icon }) => (
              <FilterTag
                key={id}
                onClose={() =>
                  dispatch({
                    type: action,
                  } as any as Action)
                }
                icon={icon ? <Icon name={ICON_NAME[icon]} size="1rem" color="#fff" /> : null}
              >
                {name}
              </FilterTag>
            ))}
          </AnalysisProposalListFiltersList>
        )}
      </AnalysisProposalListFiltersContainer>
    </>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  userConnected: state.user.user,
})

const AnalysisDashboardHeaderConnected = connect<any, any>(mapStateToProps)(AnalysisDashboardHeader)
export default createPaginationContainer(
  AnalysisDashboardHeaderConnected,
  {
    project: graphql`
      fragment AnalysisDashboardHeader_project on Project
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        orderBy: { type: "ProposalOrder!", defaultValue: { field: PUBLISHED_AT, direction: DESC } }
        category: { type: "ID", defaultValue: null }
        district: { type: "ID", defaultValue: null }
        theme: { type: "ID", defaultValue: null }
        analysts: { type: "[ID!]", defaultValue: null }
        supervisor: { type: "ID", defaultValue: null }
        decisionMaker: { type: "ID", defaultValue: null }
        state: { type: "ProposalTaskState", defaultValue: null }
        term: { type: "String", defaultValue: null }
      ) {
        id
        steps {
          id
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
        proposals: viewerAssignedProposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          category: $category
          district: $district
          theme: $theme
          analysts: $analysts
          supervisor: $supervisor
          decisionMaker: $decisionMaker
          state: $state
          term: $term
        )
          @connection(
            key: "AnalysisDashboardHeader_proposals"
            filters: [
              "orderBy"
              "category"
              "district"
              "theme"
              "analysts"
              "supervisor"
              "decisionMaker"
              "state"
              "term"
            ]
          ) {
          edges {
            node {
              id
              analyses {
                state
                analyst {
                  id
                }
              }
              assessment {
                state
                supervisor {
                  id
                }
              }
              decision {
                state
                isApproved
                decisionMaker {
                  id
                }
              }
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
        firstCollectStep {
          form {
            objectType
          }
        }
      }
    `,
    themes: graphql`
      fragment AnalysisDashboardHeader_themes on Theme @relay(plural: true) {
        id
        title
      }
    `,
  },
  {
    direction: 'forward',

    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * @ts-expect-error
     * */
    getConnectionFromProps(props: Props) {
      return props.project && props.project.proposals
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, projectId: props.project && props.project.id }
    },

    query: graphql`
      query AnalysisDashboardHeaderProposalsPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: ProposalOrder!
        $category: ID
        $district: ID
        $theme: ID
        $analysts: [ID!]
        $supervisor: ID
        $decisionMaker: ID
        $state: ProposalTaskState
        $term: String
      ) {
        project: node(id: $projectId) {
          id
          ...AnalysisDashboardHeader_project
            @arguments(
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              category: $category
              district: $district
              theme: $theme
              analysts: $analysts
              supervisor: $supervisor
              decisionMaker: $decisionMaker
              state: $state
              term: $term
            )
        }
      }
    `,
  },
)
