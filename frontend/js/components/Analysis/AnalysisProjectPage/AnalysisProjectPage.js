// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { AnalysisProjectPage_project } from '~relay/AnalysisProjectPage_project.graphql';
import PickableList from '~ui/List/PickableList';
import BodyInfos from '~ui/Boxes/BodyInfos';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import InlineSelect from '~ui/InlineSelect';
import Loader from '~ui/FeedbacksIndicators/Loader';
import colors from '~/utils/colors';
import AnalysisProjectPageContainer, {
  ProposalListNoContributions,
  ProposalListLoaderContainer,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.style';
import { useAnalysisProposalsContext } from './AnalysisProjectPage.context';
import { STATE, type StateValues } from './AnalysisProjectPage.reducer';
import AnalysisDashboardHeader from '~/components/Analysis/AnalysisDashboardHeader/AnalysisDashboardHeader';
import AnalysisProposal from '~/components/Analysis/AnalysisProposal/AnalysisProposal';
import { AnalysisProposalListHeaderContainer } from '~ui/Analysis/common.style';
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql';

export const ANALYSIS_PROJECT_PROPOSALS_PAGINATION = 20;

export type Props = {|
  project: AnalysisProjectPage_project,
  defaultUsers: $PropertyType<AnalysisIndexPageQueryResponse, 'defaultUsers'>,
  relay: RelayPaginationProp,
|};

const NoResult = () => (
  <ProposalListNoContributions>
    <Icon name={ICON_NAME.messageBubble} size={50} color={colors.darkGray} />
    <FormattedMessage id="global.no_proposals" tagName="p" />
  </ProposalListNoContributions>
);

const ProposalListLoader = () => (
  <ProposalListLoaderContainer>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </ProposalListLoaderContainer>
);

const AnalysisProjectPage = ({ project, defaultUsers, relay }: Props) => {
  const {
    sortedProposals: dataProposals,
    viewerProposalsTodo,
    viewerProposalsDone,
    viewerProposalsAll,
  } = project;
  const proposals = dataProposals?.edges?.filter(Boolean).map(edge => edge.node);
  const hasProposals = dataProposals?.totalCount > 0;
  const { parameters, dispatch } = useAnalysisProposalsContext();
  const descriptionProject = project.firstCollectStep?.form?.analysisConfiguration?.body;

  return (
    <AnalysisProjectPageContainer>
      <div>
        <h2>{project.title}</h2>
        {descriptionProject && <BodyInfos body={descriptionProject} maxLines={5} />}
      </div>

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
          <FormattedMessage id="count.status.all" values={{ num: viewerProposalsAll.totalCount }} />
        </InlineSelect.Choice>
      </InlineSelect>

      <PickableList.Provider>
        <PickableList
          useInfiniteScroll={hasProposals}
          onScrollToBottom={() => {
            relay.loadMore(ANALYSIS_PROJECT_PROPOSALS_PAGINATION);
          }}
          hasMore={relay.hasMore()}
          loader={<ProposalListLoader key="loader" />}>
          <AnalysisProposalListHeaderContainer>
            <AnalysisDashboardHeader project={project} defaultUsers={defaultUsers} />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasProposals ? (
              proposals?.map(proposal => (
                <AnalysisProposal proposal={proposal} key={proposal.id} rowId={proposal.id} />
              ))
            ) : (
              <NoResult />
            )}
          </PickableList.Body>
        </PickableList>
      </PickableList.Provider>
    </AnalysisProjectPageContainer>
  );
};

export default createPaginationContainer(
  AnalysisProjectPage,
  {
    project: graphql`
      fragment AnalysisProjectPage_project on Project
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          analysts: { type: "[ID!]", defaultValue: null }
          supervisor: { type: "ID", defaultValue: null }
          decisionMaker: { type: "ID", defaultValue: null }
          state: { type: "ProposalTaskState", defaultValue: null }
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
        sortedProposals: viewerAssignedProposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          category: $category
          district: $district
          analysts: $analysts
          supervisor: $supervisor
          decisionMaker: $decisionMaker
          state: $state
        )
          @connection(
            key: "AnalysisProjectPage_sortedProposals"
            filters: [
              "orderBy"
              "category"
              "district"
              "analysts"
              "supervisor"
              "decisionMaker"
              "state"
            ]
          ) {
          edges {
            cursor
            node {
              id
              ...AnalysisProposal_proposal
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
        $cursor: String
        $orderBy: ProposalOrder!
        $category: ID
        $district: ID
        $analysts: [ID!]
        $supervisor: ID
        $decisionMaker: ID
        $state: ProposalTaskState
      ) {
        project: node(id: $projectId) {
          id
          ...AnalysisProjectPage_project
            @arguments(
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              category: $category
              district: $district
              analysts: $analysts
              supervisor: $supervisor
              decisionMaker: $decisionMaker
              state: $state
            )
        }
      }
    `,
  },
);
