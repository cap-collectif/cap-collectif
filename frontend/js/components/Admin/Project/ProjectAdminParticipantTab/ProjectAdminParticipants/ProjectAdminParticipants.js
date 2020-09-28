// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import {
  getAllFormattedChoicesForProject,
  getDifferenceFilters,
} from '../ProjectAdminParticipants.utils';
import { useProjectAdminParticipantsContext } from '../ProjectAdminParticipant.context';
import type { SortValues, Action } from '../ProjectAdminParticipant.reducer';
import {
  AnalysisPickableListContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersList,
  AnalysisProposalListHeaderContainer,
} from '~ui/Analysis/common.style';
import AnalysisProposalListLoader from '~/components/Analysis/AnalysisProposalListLoader/AnalysisProposalListLoader';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import FilterTag from '~ui/Analysis/FilterTag';
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort';
import ProjectAdminParticipant from '../ProjectAdminParticipant/ProjectAdminParticipant';
import ClearableInput from '~ui/Form/Input/ClearableInput';
import { HeaderContainer } from './ProjetAdminParticipants.style';
import NoParticipant from '~/components/Admin/Project/ProjectAdminParticipantTab/NoParticipant/NoParticipant';
import ExportButton from '~/components/Admin/Project/ExportButton/ExportButton';
import type { ProjectAdminParticipants_project } from '~relay/ProjectAdminParticipants_project.graphql';

export const PROJECT_ADMIN_PARTICIPANT_PAGINATION = 30;

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProjectAdminParticipants_project,
|};

const DashboardHeader = ({ project }: $Diff<Props, { relay: * }>) => {
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch } = useProjectAdminParticipantsContext();
  const intl = useIntl();
  const { steps, userTypes, filtersOrdered } = React.useMemo(
    () => getAllFormattedChoicesForProject(project, parameters.filtersOrdered),
    [project, parameters.filtersOrdered],
  );

  const renderFilters = (
    <>
      <Collapsable align="right">
        <Collapsable.Button>
          <FormattedMessage id="admin.label.step" />
        </Collapsable.Button>
        <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter-by' })}>
          <DropdownSelect
            shouldOverflow
            value={parameters.filters.step}
            defaultValue="ALL"
            onChange={newValue => dispatch({ type: 'CHANGE_STEP_FILTER', payload: newValue })}
            title={intl.formatMessage({ id: 'filter-by' })}>
            <DropdownSelect.Choice value="ALL">
              {intl.formatMessage({ id: 'every-step' })}
            </DropdownSelect.Choice>
            {steps.map(step => (
              <DropdownSelect.Choice key={step.id} value={step.id}>
                {step.title}
              </DropdownSelect.Choice>
            ))}
          </DropdownSelect>
        </Collapsable.Element>
      </Collapsable>

      {userTypes?.length > 0 && (
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage id="admin.fields.source.category" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'filter-by' })}>
            <DropdownSelect
              shouldOverflow
              value={parameters.filters.type}
              defaultValue="ALL"
              onChange={newValue => dispatch({ type: 'CHANGE_TYPE_FILTER', payload: newValue })}
              title={intl.formatMessage({ id: 'filter-by' })}>
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({ id: 'global.select_user.type' })}
              </DropdownSelect.Choice>
              {userTypes.map(userType => (
                <DropdownSelect.Choice value={userType.id} key={userType.id}>
                  {intl.formatMessage({ id: userType.name })}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      <AnalysisFilterSort
        isParticipant
        value={parameters.sort}
        onChange={newValue => {
          dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
        }}
      />
    </>
  );

  return (
    <React.Fragment>
      <p>
        {rowsCount}{' '}
        <FormattedMessage id="project.preview.counters.contributors" values={{ num: rowsCount }} />
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
  );
};

export const ProjectAdminParticipants = ({ project, relay }: Props) => {
  const { parameters, status, dispatch } = useProjectAdminParticipantsContext();
  const intl = useIntl();
  const hasParticipants = project.participants?.totalCount > 0;
  const hasSelectedFilters = getDifferenceFilters(parameters.filters);

  return (
    <AnalysisPickableListContainer>
      <HeaderContainer>
        <ExportButton
          hasMarginRight
          disabled={!hasParticipants}
          linkHelp="https://aide.cap-collectif.com/article/67-exporter-les-contributions-dun-projet-participatif"
          onChange={stepId => {
            window.open(`/export-step-contributors/${stepId}`, '_blank');
          }}>
          {project.exportableSteps.filter(Boolean).map(({ step }) => {
            if (step.contributors && step.contributors.totalCount > 0) {
              return (
                <DropdownSelect.Choice key={step.id} value={step.id} className="export-option">
                  {step.title}
                </DropdownSelect.Choice>
              );
            }
            return null;
          })}
        </ExportButton>

        <ClearableInput
          id="search"
          name="search"
          disabled={!hasParticipants}
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
      </HeaderContainer>

      <PickableList
        isLoading={status === 'loading'}
        useInfiniteScroll={hasParticipants}
        onScrollToBottom={() => {
          relay.loadMore(PROJECT_ADMIN_PARTICIPANT_PAGINATION);
        }}
        hasMore={project.participants?.pageInfo.hasNextPage}
        loader={<AnalysisProposalListLoader key="loader" />}>
        <AnalysisProposalListHeaderContainer
          isSelectable={false}
          disabled={!hasSelectedFilters && !hasParticipants}>
          <DashboardHeader project={project} />
        </AnalysisProposalListHeaderContainer>

        <PickableList.Body>
          {hasParticipants ? (
            project.participants?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(participant => (
                <ProjectAdminParticipant
                  participant={participant}
                  key={participant.id}
                  rowId={participant.id}
                />
              ))
          ) : (
            <NoParticipant />
          )}
        </PickableList.Body>
      </PickableList>
    </AnalysisPickableListContainer>
  );
};

export default createPaginationContainer(
  ProjectAdminParticipants,
  {
    project: graphql`
      fragment ProjectAdminParticipants_project on Project
        @argumentDefinitions(
          projectId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "UserOrder!", defaultValue: { field: ACTIVITY, direction: DESC } }
          term: { type: "String", defaultValue: null }
          userType: { type: "ID" }
          step: { type: "ID" }
          contribuableId: { type: "ID" }
        ) {
        id
        steps {
          __typename
          id
          title
        }
        exportableSteps {
          step {
            id
            title
            ... on ConsultationStep {
              contributors {
                totalCount
              }
            }
            ... on CollectStep {
              contributors {
                totalCount
              }
            }
            ... on SelectionStep {
              contributors {
                totalCount
              }
            }
            ... on QuestionnaireStep {
              contributors {
                totalCount
              }
            }
          }
        }
        participants: contributors(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          userType: $userType
          step: $step
        )
          @connection(
            key: "ProjectAdminParticipants_participants"
            filters: ["orderBy", "term", "userType"]
          ) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              userType {
                id
                name
              }
              ...ProjectAdminParticipant_participant @arguments(contribuableId: $contribuableId)
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
      return props.project && props.project.participants;
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
      query ProjectAdminParticipantsPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: UserOrder!
        $term: String
        $userType: ID
        $step: ID
        $contribuableId: ID
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminParticipants_project
            @arguments(
              projectId: $projectId
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              term: $term
              userType: $userType
              step: $step
              contribuableId: $contribuableId
            )
        }
      }
    `,
  },
);
