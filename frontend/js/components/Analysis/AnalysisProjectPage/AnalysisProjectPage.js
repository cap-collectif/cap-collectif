// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { RouterHistory } from 'react-router-dom';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { AnalysisProjectPage_project } from '~relay/AnalysisProjectPage_project.graphql';
import type { AnalysisProjectPage_themes } from '~relay/AnalysisProjectPage_themes.graphql';
import PickableList from '~ui/List/PickableList';
import BodyInfos from '~ui/Boxes/BodyInfos';
import InlineSelect from '~ui/InlineSelect';
import {
  Container,
  Header,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.style';
import AnalysisProposalListLoader from '../AnalysisProposalListLoader/AnalysisProposalListLoader';
import AnalysisNoProposal from '../AnalysisNoProposal/AnalysisNoProposal';
import AnalysisDashboardHeader from '../AnalysisDashboardHeader/AnalysisDashboardHeader';
import AnalysisProposal from '../AnalysisProposal/AnalysisProposal';
import { useAnalysisProposalsContext } from './AnalysisProjectPage.context';
import { STATE, type StateValues } from './AnalysisProjectPage.reducer';
import {
  getDifferenceFilters,
  getWordingEmpty,
  getFormattedProposalsWithTheme,
} from './AnalysisProjectPage.utils';
import { AnalysisProposalListHeaderContainer } from '~ui/Analysis/common.style';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';
import AnalysisProposalListRole from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import ClearableInput from '~ui/Form/Input/ClearableInput';

export const ANALYSIS_PROJECT_PROPOSALS_PAGINATION = 20;

export type Props = {|
  project: AnalysisProjectPage_project,
  themes: AnalysisProjectPage_themes,
  defaultUsers: $PropertyType<AnalysisIndexPageQueryResponse, 'defaultUsers'>,
  relay: RelayPaginationProp,
  history: RouterHistory,
|};

const AnalysisProjectPage = ({ project, themes = [], defaultUsers, relay, history }: Props) => {
  const {
    sortedProposals: dataProposals,
    viewerProposalsTodo,
    viewerProposalsDone,
    viewerProposalsAll,
  } = project;

  const proposals = dataProposals?.edges?.filter(Boolean).map(edge => edge.node);
  const hasProposals = dataProposals?.totalCount > 0;
  const { parameters, dispatch, status } = useAnalysisProposalsContext();
  const descriptionProject = project.firstCollectStep?.form?.analysisConfiguration?.body;
  const hasSelectedFilters = getDifferenceFilters(parameters.filters);
  const proposalsWithTheme = getFormattedProposalsWithTheme(project);
  const intl = useIntl();

  React.useEffect(() => {
    // Listenning that current location changed.
    const stopListenningHistory = history.listen(() => {
      dispatch({ type: 'CLEAR_FILTERS' });
    });

    return () => {
      stopListenningHistory();
    };
  }, [dispatch, history]);

  return (
    <Container>
      <div>
        <h2>{project.title}</h2>
        {descriptionProject && <BodyInfos body={descriptionProject} maxLines={5} />}
      </div>

      <Header>
        <InlineSelect
          value={parameters.filters.state}
          onChange={newValue =>
            dispatch({
              type: 'CHANGE_STATE_FILTER',
              payload: ((newValue: any): StateValues),
            })
          }>
          <InlineSelect.Choice value={STATE.TODO}>
            <FormattedMessage
              id="count.status.to.do"
              values={{ num: viewerProposalsTodo.totalCount }}
            />
          </InlineSelect.Choice>

          <InlineSelect.Choice value={STATE.DONE}>
            <FormattedMessage
              id="count.status.done"
              values={{ num: viewerProposalsDone.totalCount }}
            />
          </InlineSelect.Choice>

          <InlineSelect.Choice value={STATE.ALL}>
            <FormattedMessage
              id="filter.count.status.all"
              values={{ num: viewerProposalsAll.totalCount }}
            />
          </InlineSelect.Choice>
        </InlineSelect>

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
      </Header>

      <PickableList.Provider>
        <PickableList
          isLoading={status === 'loading'}
          useInfiniteScroll={hasProposals}
          onScrollToBottom={() => {
            relay.loadMore(ANALYSIS_PROJECT_PROPOSALS_PAGINATION);
          }}
          hasMore={relay.hasMore()}
          loader={<AnalysisProposalListLoader key="loader" />}>
          <AnalysisProposalListHeaderContainer disabled={!hasSelectedFilters && !hasProposals}>
            <AnalysisDashboardHeader
              project={project}
              defaultUsers={defaultUsers}
              themes={themes}
            />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasProposals ? (
              proposals?.map(proposal => (
                <AnalysisProposal
                  proposal={proposal}
                  key={proposal.id}
                  rowId={proposal.id}
                  dispatch={dispatch}
                  hasThemeEnabled={proposalsWithTheme.includes(proposal.id)}>
                  <AnalysisProposalListRole proposal={proposal} dispatch={dispatch} />
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
      </PickableList.Provider>
    </Container>
  );
};

export default createPaginationContainer(
  AnalysisProjectPage,
  {
    project: graphql`
      fragment AnalysisProjectPage_project on Project
        @argumentDefinitions(
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
          analysts: { type: "[ID!]", defaultValue: null }
          supervisor: { type: "ID", defaultValue: null }
          decisionMaker: { type: "ID", defaultValue: null }
          state: { type: "ProposalTaskState", defaultValue: null }
          term: { type: "String", defaultValue: null }
        ) {
        id
        title
        firstCollectStep {
          form {
            analysisConfiguration {
              body
            }
          }
        }
        steps {
          id
          __typename
          ... on ProposalStep {
            form {
              usingThemes
            }
          }
        }
        sortedProposals: viewerAssignedProposals(
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
            key: "AnalysisProjectPage_sortedProposals"
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
            cursor
            node {
              id
              form {
                step {
                  id
                }
              }
              ...AnalysisProposal_proposal
                @arguments(isAdminView: false, proposalRevisionsEnabled: $proposalRevisionsEnabled)
              ...AnalysisProposalListRole_proposal
            }
          }
          totalCount
          pageInfo {
            hasNextPage
          }
        }
        viewerProposalsTodo: viewerAssignedProposals(state: TODO) {
          totalCount
        }
        viewerProposalsDone: viewerAssignedProposals(state: DONE) {
          totalCount
        }
        viewerProposalsAll: viewerAssignedProposals(state: null) {
          totalCount
        }
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
    `,
    themes: graphql`
      fragment AnalysisProjectPage_themes on Theme @relay(plural: true) {
        ...AnalysisDashboardHeader_themes
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
      return props.project && props.project.sortedProposals;
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
        projectId: props.project && props.project.id,
      };
    },
    query: graphql`
      query AnalysisProjectPageProposalsPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $proposalRevisionsEnabled: Boolean!
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
          ...AnalysisProjectPage_project
            @arguments(
              count: $count
              proposalRevisionsEnabled: $proposalRevisionsEnabled
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
        themes {
          ...AnalysisDashboardHeader_themes
        }
      }
    `,
  },
);
