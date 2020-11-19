// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import type { ProjectAdminAnalysis_project } from '~relay/ProjectAdminAnalysis_project.graphql';
import type { ProjectAdminAnalysis_themes } from '~relay/ProjectAdminAnalysis_themes.graphql';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  SortValues,
  Action,
  ProposalsProgressStateValues,
  ProposalsThemeValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import { getAllFormattedChoicesForProject } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils';
import {
  isRowIndeterminate,
  getSelectedAnalystsByProposals,
  getSelectedDecisionMakersByProposals,
  getSelectedSupervisorsByProposals,
  getCommonAnalystIdsWithinProposalIds,
  getCommonDecisionMakerIdWithinProposalIds,
  getCommonSupervisorIdWithinProposalIds,
  getAllUserAssigned,
  getUsersWithAnalyseBegin,
  formatDefaultUsers,
  getDifferenceFiltersAnalysis,
  getFormattedProposalsWithTheme,
} from './ProjectAdminProposals.utils';
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect';
import UserSearchDropdownChoice from '~/components/Admin/Project/UserSearchDropdownChoice';
import type { ProjectAdminAnalysisTabQueryResponse } from '~relay/ProjectAdminAnalysisTabQuery.graphql';
import {
  AnalysisPickableListContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersList,
  AnalysisProposalListHeaderContainer,
} from '~ui/Analysis/common.style';
import AnalysisProposalListLoader from '~/components/Analysis/AnalysisProposalListLoader/AnalysisProposalListLoader';
import ModalConfirmRevokement from './ModalConfirmRevokement/ModalConfirmRevokement';
import AssignSupervisorToProposalsMutation from '~/mutations/AssignSupervisorToProposalsMutation';
import AssignDecisionMakerToProposalsMutation from '~/mutations/AssignDecisionMakerToProposalsMutation';
import RevokeAnalystsToProposalsMutation from '~/mutations/RevokeAnalystsToProposalsMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import { PROPOSAL_STATUS, TYPE_ROLE } from '~/constants/AnalyseConstants';
import ProjectAdminAnalysisNoProposals from './ProjectAdminAnalysisNoProposals';
import ProjectAdminAnalysisShortcut from './ProjectAdminAnalysisShortcut';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import FilterTag from '~ui/Analysis/FilterTag';
import type { Uuid } from '~/types';
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort';
import AnalysisFilterCategory from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory';
import AnalysisFilterDistrict from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict';
import AnalysisFilterRole from '~/components/Analysis/AnalysisFilter/AnalysisFilterRole';
import AnalysisFilterTheme, {
  type ThemeFilter,
} from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme';
import AnalysisProposal from '~/components/Analysis/AnalysisProposal/AnalysisProposal';
import { loadOptions } from '~/components/Analysis/AnalysisDashboardHeader/AnalysisDashboardHeader';
import AssignAnalystsToProposalsMutation from '~/mutations/AssignAnalystsToProposalsMutation';
import type { Supervisor, DecisionMaker, Analyst } from './ProjectAdminProposals.utils';
import AnalysisProposalListRole from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import AnalysisFilterProgressState from '~/components/Analysis/AnalysisFilter/AnalysisFilterProgressState';
import { AnalysisDataContainer, AnalysisHeader } from './ProjectAdminAnalysis.style';
import AnalysisStatus from '~/components/Analysis/AnalysisStatus/AnalysisStatus';
import ExportButton from '~/components/Admin/Project/ExportButton/ExportButton';
import ModalDeleteProposal from '~/components/Admin/Project/ModalDeleteProposal/ModalDeleteProposal';
import type { AnalysisProposal_proposal } from '~relay/AnalysisProposal_proposal.graphql';
import ClearableInput from '~ui/Form/Input/ClearableInput';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

type DataModalState = {|
  analysts: Uuid[],
  assignment?: ?Uuid,
  type: $Values<typeof TYPE_ROLE>,
  analystsWithAnalyseBegin: $ReadOnlyArray<Analyst | Supervisor | DecisionMaker>,
|};

type Props = {|
  +relay: RelayPaginationProp,
  +defaultUsers: $PropertyType<ProjectAdminAnalysisTabQueryResponse, 'defaultUsers'>,
  +project: ProjectAdminAnalysis_project,
  +themes: ProjectAdminAnalysis_themes,
|};

const assignAnalysts = async (
  analystsAdded: Uuid[],
  analystsRemoved: Uuid[],
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  analystsWithAnalyseBegin: $ReadOnlyArray<Analyst>,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean =
      analystsWithAnalyseBegin.length > 0 &&
      analystsRemoved.filter(analystId =>
        analystsWithAnalyseBegin.some(({ id }) => id === analystId),
      ).length > 0;

    if (analystsAdded.length > 0) {
      dispatch({ type: 'START_LOADING' });

      const response = await AssignAnalystsToProposalsMutation.commit({
        input: {
          analystIds: analystsAdded,
          proposalIds: selectedProposalIds,
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

    if (analystsRemoved.length > 0) {
      if (needConfirm) {
        setDataModal(
          (({
            analysts: analystsRemoved,
            type: TYPE_ROLE.ANALYST,
            analystsWithAnalyseBegin,
          }: any): DataModalState),
        );
      } else {
        dispatch({ type: 'START_LOADING' });

        await RevokeAnalystsToProposalsMutation.commit({
          input: {
            analystIds: analystsRemoved,
            proposalIds: selectedProposalIds,
          },
        });
      }
    }

    dispatch({ type: 'STOP_LOADING' });
  } catch (e) {
    dispatch({ type: 'STOP_LOADING' });

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
};

const assignNobodyAnalysts = async (
  allAnalysts: Uuid[],
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  analystsWithAnalyseBegin: $ReadOnlyArray<Analyst>,
  closeDropdown: () => void,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean = analystsWithAnalyseBegin.length > 0;

    closeDropdown();

    if (needConfirm) {
      setDataModal(
        (({
          analysts: allAnalysts,
          type: TYPE_ROLE.ANALYST,
          analystsWithAnalyseBegin,
        }: any): DataModalState),
      );
    } else {
      dispatch({ type: 'START_LOADING' });
      await RevokeAnalystsToProposalsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          analystIds: allAnalysts,
        },
      });
      dispatch({ type: 'STOP_LOADING' });
    }
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
};

const assignSupervisor = async (
  assigneeId: ?Uuid,
  supervisors: $ReadOnlyArray<Supervisor>,
  supervisorsWithAnalyseBegin: $ReadOnlyArray<Supervisor>,
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  closeDropdown: () => void,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean = supervisorsWithAnalyseBegin.length > 0;

    closeDropdown();

    if (needConfirm) {
      const supervisorIds = supervisors.map(({ id }) => id);

      setDataModal(
        (({
          analysts: supervisorIds,
          assignment: assigneeId,
          type: TYPE_ROLE.SUPERVISOR,
          analystsWithAnalyseBegin: supervisorsWithAnalyseBegin,
        }: any): DataModalState),
      );
    } else {
      dispatch({ type: 'START_LOADING' });
      await AssignSupervisorToProposalsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          supervisorId: ((assigneeId: any): string),
        },
      });
      dispatch({ type: 'STOP_LOADING' });
    }
  } catch (e) {
    dispatch({ type: 'STOP_LOADING' });

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
};

const assignNobodySupervisor = async (
  supervisors: $ReadOnlyArray<Supervisor>,
  supervisorsWithAnalyseBegin: $ReadOnlyArray<Supervisor>,
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  closeDropdown: () => void,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean = supervisorsWithAnalyseBegin.length > 0;

    closeDropdown();

    if (needConfirm) {
      const supervisorIds = supervisors.map(({ id }) => id);

      setDataModal(
        (({
          analysts: supervisorIds,
          assignment: null,
          type: TYPE_ROLE.SUPERVISOR,
          analystsWithAnalyseBegin: supervisorsWithAnalyseBegin,
        }: any): DataModalState),
      );
    } else {
      dispatch({ type: 'START_LOADING' });
      await AssignSupervisorToProposalsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          supervisorId: null,
        },
      });
      dispatch({ type: 'STOP_LOADING' });
    }
  } catch (e) {
    dispatch({ type: 'STOP_LOADING' });
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
};

const assignDecisionMaker = async (
  assigneeId: ?Uuid,
  decisionMakers: $ReadOnlyArray<DecisionMaker>,
  decisionMakersWithAnalyseBegin: $ReadOnlyArray<DecisionMaker>,
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  closeDropdown: () => void,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean = decisionMakersWithAnalyseBegin.length > 0;

    closeDropdown();

    if (needConfirm) {
      const decisionMakerIds = decisionMakers.map(({ id }) => id);

      setDataModal(
        (({
          analysts: decisionMakerIds,
          assignment: assigneeId,
          type: TYPE_ROLE.DECISION_MAKER,
          analystsWithAnalyseBegin: decisionMakersWithAnalyseBegin,
        }: any): DataModalState),
      );
    } else {
      dispatch({ type: 'START_LOADING' });
      await AssignDecisionMakerToProposalsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          decisionMakerId: ((assigneeId: any): string),
        },
      });
      dispatch({ type: 'STOP_LOADING' });
    }
  } catch (e) {
    dispatch({ type: 'STOP_LOADING' });
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
};

const assignNobodyDecisionMaker = async (
  decisionMakers: $ReadOnlyArray<DecisionMaker>,
  decisionMakersWithAnalyseBegin: $ReadOnlyArray<DecisionMaker>,
  selectedProposalIds: $ReadOnlyArray<Uuid>,
  closeDropdown: () => void,
  setDataModal: DataModalState => void,
  dispatch: any => void,
) => {
  try {
    const needConfirm: boolean = decisionMakersWithAnalyseBegin.length > 0;

    closeDropdown();

    if (needConfirm) {
      const decisionMakerIds = decisionMakers.map(({ id }) => id);

      setDataModal(
        (({
          analysts: decisionMakerIds,
          assignment: null,
          type: TYPE_ROLE.DECISION_MAKER,
          analystsWithAnalyseBegin: decisionMakersWithAnalyseBegin,
        }: any): DataModalState),
      );
    } else {
      dispatch({ type: 'START_LOADING' });
      await AssignDecisionMakerToProposalsMutation.commit({
        input: {
          proposalIds: selectedProposalIds,
          decisionMakerId: null,
        },
      });
      dispatch({ type: 'STOP_LOADING' });
    }
  } catch (e) {
    dispatch({ type: 'STOP_LOADING' });
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
};

const ProposalListHeader = ({ project, themes, defaultUsers }: $Diff<Props, { relay: * }>) => {
  const intl = useIntl();
  const { selectedRows, rowsCount } = usePickableList();

  const allUserAssigned = React.useMemo(() => getAllUserAssigned(project), [project]);

  const {
    analysts: analystsWithAnalyseBegin,
    supervisors: supervisorsWithAnalyseBegin,
    decisionMakers: decisionMakersWithAnalyseBegin,
  } = getUsersWithAnalyseBegin(project, selectedRows);
  const { parameters, dispatch } = useProjectAdminProposalsContext();

  const [supervisor, setSupervisor] = React.useState(null);
  const [decisionMaker, setDecisionMaker] = React.useState(null);
  const [analysts, setAnalysts] = React.useState({
    all: [],
    removed: [],
    added: [],
    values: [],
  });
  const [dataModal, setDataModal] = React.useState<?DataModalState>(null);

  const proposalsWithTheme = getFormattedProposalsWithTheme(project);

  const { categories, districts, filtersOrdered } = React.useMemo(
    () => getAllFormattedChoicesForProject(project, parameters.filtersOrdered, intl, themes),
    [project, parameters.filtersOrdered, intl, themes],
  );
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

  const renderFilters = (
    <>
      {districts?.length > 0 && (
        <AnalysisFilterDistrict
          districts={districts}
          value={parameters.filters.district}
          onChange={newValue =>
            dispatch({
              type: 'CHANGE_DISTRICT_FILTER',
              payload: ((newValue: any): ProposalsDistrictValues),
            })
          }
        />
      )}

      {proposalsWithTheme?.length > 0 && themes?.length > 0 && (
        <AnalysisFilterTheme
          themes={((themes: any): $ReadOnlyArray<ThemeFilter>)}
          value={parameters.filters.theme}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_THEME_FILTER',
              payload: ((newValue: any): ProposalsThemeValues),
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

      <AnalysisFilterProgressState
        value={parameters.filters.progressState}
        onChange={newValue => {
          dispatch({
            type: 'CHANGE_PROGRESS_STATE_FILTER',
            payload: ((newValue: any): ProposalsProgressStateValues),
          });
        }}
      />

      <AnalysisFilterRole
        isMultiSelect
        type={TYPE_ROLE.ANALYST}
        title="panel.analysis.subtitle"
        titleFilter="filter.by.assigned.analyst"
        value={parameters.filters.analysts}
        allUserAssigned={allUserAssigned.analysts}
        reset={{
          enabled: true,
          disabled: parameters.filters.analysts.length === 0,
          message: intl.formatMessage({ id: 'reset.analysis.filter' }),
          onReset: () =>
            dispatch({
              type: 'CHANGE_ANALYSTS_FILTER',
              payload: [],
            }),
        }}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_ANALYSTS_FILTER',
            payload: ((newValue: any): Uuid[]),
          })
        }
      />

      <AnalysisFilterRole
        type={TYPE_ROLE.SUPERVISOR}
        title="global.review"
        titleFilter="filter.by.assigned.supervisor"
        value={parameters.filters.supervisor}
        allUserAssigned={allUserAssigned.supervisors}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_SUPERVISOR_FILTER',
            payload: ((newValue: any): Uuid),
          })
        }
      />

      <AnalysisFilterRole
        type={TYPE_ROLE.DECISION_MAKER}
        title="global.decision"
        titleFilter="filter.by.assigned.decision-maker"
        value={parameters.filters.decisionMaker}
        allUserAssigned={allUserAssigned.decisionMakers}
        onChange={newValue =>
          dispatch({
            type: 'CHANGE_DECISION_MAKER_FILTER',
            payload: ((newValue: any): Uuid),
          })
        }
      />

      <AnalysisFilterSort
        hasRevisions
        value={parameters.sort}
        onChange={newValue => {
          dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
        }}
      />
    </>
  );

  const renderActions = (
    <React.Fragment>
      <Collapsable
        align="right"
        key="action-analyst"
        onClose={() =>
          assignAnalysts(
            analysts.added,
            analysts.removed,
            selectedRows,
            analystsWithAnalyseBegin,
            setDataModal,
            dispatch,
          )
        }>
        {closeDropdown => (
          <React.Fragment>
            <Collapsable.Button>
              <FormattedMessage tagName="p" id="panel.analysis.subtitle" />
            </Collapsable.Button>
            <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'assign-up-to-10-analyst' })}>
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
                  onClear: () =>
                    assignNobodyAnalysts(
                      analysts.all,
                      selectedRows,
                      analystsWithAnalyseBegin,
                      closeDropdown,
                      setDataModal,
                      dispatch,
                    ),
                }}
                title={intl.formatMessage({ id: 'assign-up-to-10-analyst' })}
                defaultOptions={formatDefaultUsers(defaultUsers, selectedAnalystsByProposals)}
                loadOptions={loadOptions}>
                {users =>
                  users.map(user => (
                    <UserSearchDropdownChoice
                      type={TYPE_ROLE.ANALYST}
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
                onChange={assigneeId =>
                  assignSupervisor(
                    assigneeId,
                    selectedSupervisorsByProposals,
                    supervisorsWithAnalyseBegin,
                    selectedRows,
                    closeDropdown,
                    setDataModal,
                    dispatch,
                  )
                }
                noResultsMessage={intl.formatMessage({ id: 'no_result' })}
                clearChoice={{
                  enabled: true,
                  message: intl.formatMessage({ id: 'assigned.to.nobody' }),
                  onClear: () =>
                    assignNobodySupervisor(
                      selectedSupervisorsByProposals,
                      supervisorsWithAnalyseBegin,
                      selectedRows,
                      closeDropdown,
                      setDataModal,
                      dispatch,
                    ),
                }}
                title={intl.formatMessage({ id: 'assign-supervisor' })}
                defaultOptions={formatDefaultUsers(defaultUsers, selectedSupervisorsByProposals)}
                loadOptions={loadOptions}>
                {users =>
                  users.map(user => (
                    <UserSearchDropdownChoice
                      type={TYPE_ROLE.SUPERVISOR}
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
                onChange={assigneeId =>
                  assignDecisionMaker(
                    assigneeId,
                    selectedDecisionMakersByProposals,
                    decisionMakersWithAnalyseBegin,
                    selectedRows,
                    closeDropdown,
                    setDataModal,
                    dispatch,
                  )
                }
                noResultsMessage={intl.formatMessage({ id: 'no_result' })}
                clearChoice={{
                  enabled: true,
                  message: intl.formatMessage({ id: 'assigned.to.nobody' }),
                  onClear: () =>
                    assignNobodyDecisionMaker(
                      selectedDecisionMakersByProposals,
                      decisionMakersWithAnalyseBegin,
                      selectedRows,
                      closeDropdown,
                      setDataModal,
                      dispatch,
                    ),
                }}
                title={intl.formatMessage({ id: 'assign-decision-maker' })}
                defaultOptions={formatDefaultUsers(defaultUsers, selectedDecisionMakersByProposals)}
                loadOptions={loadOptions}>
                {users =>
                  users.map(user => (
                    <UserSearchDropdownChoice
                      type={TYPE_ROLE.DECISION_MAKER}
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

          {dataModal && (
            <ModalConfirmRevokement
              show={dataModal.analysts?.length > 0}
              onClose={() => setDataModal(null)}
              analystsRevoked={dataModal.analysts}
              analystAssigned={dataModal.assignment}
              analystsWithAnalyseBegin={dataModal.analystsWithAnalyseBegin}
              selectedProposals={selectedRows}
              type={dataModal.type}
            />
          )}
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

export const ProjectAdminAnalysis = ({ project, themes, defaultUsers, relay }: Props) => {
  const intl = useIntl();
  const { parameters, status, dispatch } = useProjectAdminProposalsContext();
  const proposalsWithTheme = getFormattedProposalsWithTheme(project);

  const hasProposals =
    !!project.firstAnalysisStep?.proposals?.totalCount &&
    project.firstAnalysisStep?.proposals?.totalCount > 0;
  const hasSelectedFilters = getDifferenceFiltersAnalysis(parameters.filters);
  const [proposalSelected, setProposalSelected] = React.useState<?string>(null);
  const [proposalModalDelete, setProposalModalDelete] = React.useState<?AnalysisProposal_proposal>(
    null,
  );

  const getProjectExportUrl = (type: string): string => {
    switch (type) {
      case 'analysis-export':
        return `/projects/${project.slug}/analysis/download`;
      case 'decision-export':
        return `/projects/${project.slug}/decisions/download`;
      default:
        return '';
    }
  };

  return (
    <AnalysisPickableListContainer>
      <AnalysisHeader>
        <ProjectAdminAnalysisShortcut project={project} />

        <div>
          <ExportButton
            onChange={type => {
              window.open(getProjectExportUrl(type), '_blank');
            }}
            disabled={!hasProposals}
            linkHelp="https://aide.cap-collectif.com/article/67-exporter-les-contributions-dun-projet-participatif">
            <DropdownSelect.Choice key="analysis-export" value="analysis-export">
              <FormattedMessage id="export.option.analysis-form" />
            </DropdownSelect.Choice>
            <DropdownSelect.Choice key="decision-export" value="decision-export">
              <FormattedMessage id="export.option.opinion-decision" />
            </DropdownSelect.Choice>
          </ExportButton>

          <ClearableInput
            id="search"
            name="search"
            type="text"
            icon={<i className="cap cap-magnifier" />}
            disabled={!hasProposals}
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
        </div>
      </AnalysisHeader>

      <PickableList
        isLoading={status === 'loading'}
        useInfiniteScroll={hasProposals}
        onScrollToBottom={() => {
          relay.loadMore(PROJECT_ADMIN_PROPOSAL_PAGINATION);
        }}
        hasMore={project.firstAnalysisStep?.proposals?.pageInfo.hasNextPage}
        loader={<AnalysisProposalListLoader key="loader" />}>
        <AnalysisProposalListHeaderContainer disabled={!hasSelectedFilters && !hasProposals}>
          <ProposalListHeader project={project} defaultUsers={defaultUsers} themes={themes} />
        </AnalysisProposalListHeaderContainer>

        <PickableList.Body>
          {hasProposals ? (
            project.firstAnalysisStep?.proposals?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(proposal => (
                <AnalysisProposal
                  isAdminView
                  proposal={proposal}
                  key={proposal.id}
                  rowId={proposal.id}
                  dispatch={dispatch}
                  setProposalModalDelete={setProposalModalDelete}
                  proposalSelected={proposalSelected || null}
                  setProposalSelected={setProposalSelected}
                  hasThemeEnabled={proposalsWithTheme.includes(proposal.id)}>
                  <AnalysisDataContainer>
                    <AnalysisStatus
                      status={PROPOSAL_STATUS[proposal.progressStatus]}
                      onClick={() =>
                        dispatch({
                          type: 'CHANGE_PROGRESS_STATE_FILTER',
                          payload: proposal.progressStatus,
                        })
                      }
                    />
                    <AnalysisProposalListRole proposal={proposal} dispatch={dispatch} />
                  </AnalysisDataContainer>
                </AnalysisProposal>
              ))
          ) : (
            <ProjectAdminAnalysisNoProposals project={project} />
          )}
        </PickableList.Body>
      </PickableList>

      {!!proposalModalDelete && (
        <ModalDeleteProposal
          isAnalysis
          proposal={proposalModalDelete}
          parentConnectionId={project.firstAnalysisStep?.id}
          show={!!proposalModalDelete}
          onClose={() => setProposalModalDelete(null)}
          parametersConnection={parameters}
        />
      )}
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
          proposalRevisionsEnabled: { type: "Boolean!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          theme: { type: "ID", defaultValue: null }
          progressStatus: { type: "ProposalProgressState", defaultValue: null }
          status: { type: "ID", defaultValue: null }
          term: { type: "String", defaultValue: null }
          analysts: { type: "[ID!]", defaultValue: null }
          supervisor: { type: "ID", defaultValue: null }
          decisionMaker: { type: "ID", defaultValue: null }
        ) {
        id
        slug
        ...ProjectAdminAnalysisNoProposals_project
        ...ProjectAdminAnalysisShortcut_project
        steps {
          id
          __typename
          ... on ProposalStep {
            form {
              usingThemes
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
          id
          proposals(
            first: $count
            after: $cursor
            orderBy: $orderBy
            category: $category
            district: $district
            theme: $theme
            term: $term
            progressStatus: $progressStatus
            analysts: $analysts
            supervisor: $supervisor
            decisionMaker: $decisionMaker
          )
            @connection(
              key: "ProjectAdminAnalysis_proposals"
              filters: [
                "orderBy"
                "category"
                "district"
                "theme"
                "term"
                "analysts"
                "supervisor"
                "decisionMaker"
                "progressStatus"
              ]
            ) {
            totalCount
            pageInfo {
              hasNextPage
            }
            edges {
              node {
                id
                progressStatus
                form {
                  step {
                    id
                  }
                }
                ...AnalysisProposal_proposal
                  @arguments(isAdminView: true, proposalRevisionsEnabled: $proposalRevisionsEnabled)
                supervisor {
                  id
                  username
                  ...UserSearchDropdownChoice_user
                  ...ModalConfirmRevokement_analystsWithAnalyseBegin
                }
                decisionMaker {
                  id
                  username
                  ...UserSearchDropdownChoice_user
                  ...ModalConfirmRevokement_analystsWithAnalyseBegin
                }
                analysts {
                  id
                  username
                  ...UserSearchDropdownChoice_user
                  ...ModalConfirmRevokement_analystsWithAnalyseBegin
                }
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
                ...AnalysisProposalListRole_proposal
              }
              cursor
            }
          }
        }
      }
    `,
    themes: graphql`
      fragment ProjectAdminAnalysis_themes on Theme @relay(plural: true) {
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
        $proposalRevisionsEnabled: Boolean!
        $cursor: String
        $orderBy: ProposalOrder!
        $category: ID
        $district: ID
        $theme: ID
        $term: String
        $progressStatus: ProposalProgressState
        $analysts: [ID!]
        $supervisor: ID
        $decisionMaker: ID
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminAnalysis_project
            @arguments(
              projectId: $projectId
              count: $count
              proposalRevisionsEnabled: $proposalRevisionsEnabled
              cursor: $cursor
              orderBy: $orderBy
              category: $category
              district: $district
              theme: $theme
              term: $term
              progressStatus: $progressStatus
              analysts: $analysts
              supervisor: $supervisor
              decisionMaker: $decisionMaker
            )
        }
      }
    `,
  },
);
