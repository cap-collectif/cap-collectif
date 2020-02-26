// @flow
import React from 'react';
import moment from 'moment';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import * as S from './ProjectAdminProposals.style';
import Tag from '~ui/Labels/Tag';
import Loader from '~ui/FeedbacksIndicators/Loader';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProjectAdminProposals_project,
|};

const ProposalListLoader = () => (
  <S.ProposalListLoader>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </S.ProposalListLoader>
);

const ProposalListHeader = () => {
  const { selectedRows, rowsCount } = usePickableList();
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
          <p>Action 1 quand select</p>
          <p>Action 2 quand select</p>
          <p>Action 3 quand select</p>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount} <FormattedMessage id="global.proposals" />
          </p>
          <FormattedMessage tagName="p" id="admin.fields.proposal.map.zone" />
          <FormattedMessage tagName="p" id="admin.fields.proposal.theme" />
          <FormattedMessage tagName="p" id="admin.fields.proposal.category" />
          <FormattedMessage tagName="p" id="admin.label.step" />
          <FormattedMessage tagName="p" id="admin.fields.proposal.status" />
          <FormattedMessage tagName="p" id="argument.sort.label" />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const ProjectAdminProposals = ({ project, relay }: Props) => {
  const hasProposals = project.proposals?.totalCount > 0;
  return (
    <PickableList.Provider>
      <S.ProposalPickableList
        useInfiniteScroll={hasProposals}
        onScrollToBottom={() => {
          relay.loadMore(PROJECT_ADMIN_PROPOSAL_PAGINATION);
        }}
        hasMore={project.proposals?.pageInfo.hasNextPage}
        loader={<ProposalListLoader key="loader" />}>
        <PickableList.Header>
          <ProposalListHeader />
        </PickableList.Header>
        <PickableList.Body>
          {hasProposals ? (
            project.proposals?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(proposal => (
                <S.ProposalListRow key={proposal.id} rowId={proposal.id}>
                  <h2>{proposal.title}</h2>
                  <S.ProposalListRowInformations>
                    <p>
                      #{proposal.reference} • {proposal.author.username} •{' '}
                      <FormattedMessage id="submited_on" />{' '}
                      <FormattedDate
                        value={moment(proposal.publishedAt)}
                        day="numeric"
                        month="long"
                        year="numeric"
                      />
                    </p>
                    <S.ProposalListRowInformationsStepState>
                      {proposal.currentVotableStep && (
                        <S.ProposalVotableStepTitle>
                          {proposal.currentVotableStep.title}
                        </S.ProposalVotableStepTitle>
                      )}
                      {proposal.status && (
                        <S.Label bsStyle={proposal.status.color}>{proposal.status.name}</S.Label>
                      )}
                    </S.ProposalListRowInformationsStepState>
                  </S.ProposalListRowInformations>
                  <S.ProposalListRowMeta>
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
                  </S.ProposalListRowMeta>
                </S.ProposalListRow>
              ))
          ) : (
            <S.ProposalListNoContributions>
              <S.NoContributionIcon />
              <FormattedMessage id="global.no_proposals" tagName="p" />
            </S.ProposalListNoContributions>
          )}
        </PickableList.Body>
      </S.ProposalPickableList>
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
        ) {
        id
        proposals(first: $count, after: $cursor)
          @connection(key: "ProjectAdminProposals_proposals", filters: []) {
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
              status {
                id
                name
                color
              }
              currentVotableStep {
                id
                title
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
      query ProjectAdminProposalsPaginatedQuery($projectId: ID!, $count: Int!, $cursor: String) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminProposals_project
            @arguments(projectId: $projectId, count: $count, cursor: $cursor)
        }
      }
    `,
  },
);

