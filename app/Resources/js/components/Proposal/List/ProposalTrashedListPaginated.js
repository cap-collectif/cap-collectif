// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, Button } from 'react-bootstrap';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { TRASHED_PROPOSAL_PAGINATOR_COUNT } from '../../Project/ProjectTrashProposal';
import type { ProposalTrashedListPaginated_project } from '~relay/ProposalTrashedListPaginated_project.graphql';
import ProposalPreview from '../Preview/ProposalPreview';

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProposalTrashedListPaginated_project,
|};

type State = {|
  +isLoading: boolean,
|};

export class ProposalTrashedListPaginated extends React.Component<Props, State> {
  state = {
    isLoading: false,
  };

  handleLoadMore = () => {
    const { relay } = this.props;
    this.setState({ isLoading: true });
    relay.loadMore(TRASHED_PROPOSAL_PAGINATOR_COUNT, () => {
      this.setState({ isLoading: false });
    });
  };

  render() {
    const { project, relay } = this.props;
    const { isLoading } = this.state;
    if (project.proposals.totalCount === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <FormattedMessage
          id="count-proposal"
          values={{
            num: project.proposals.totalCount,
          }}
          tagName="h3"
        />
        <ListGroup bsClass="media-list proposal-preview-list" componentClass="ul">
          {project &&
            project.proposals &&
            project.proposals.edges &&
            project.proposals.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(node => (
                // $FlowFixMe $refType
                <ProposalPreview key={node.id} proposal={node} step={null} viewer={null} />
              ))}
        </ListGroup>
        {relay.hasMore() && (
          <div id="proposal-list-pagination-footer" className="text-center">
            <Button
              id="ProposalTrashedListPaginated-loadMore"
              disabled={isLoading}
              onClick={this.handleLoadMore}>
              <FormattedMessage id={isLoading ? 'global.loading' : 'see-more-proposals'} />
            </Button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  ProposalTrashedListPaginated,
  {
    project: graphql`
      fragment ProposalTrashedListPaginated_project on Project
        @argumentDefinitions(
          count: { type: "Int" }
          cursor: { type: "String" }
          stepId: { type: "ID!", defaultValue: "" }
        ) {
        id
        proposals(first: $count, after: $cursor, trashedStatus: TRASHED)
          @connection(key: "ProposalTrashedListPaginated_proposals") {
          totalCount
          edges {
            node {
              id
              ...ProposalPreview_proposal
                @arguments(isProfileView: true, stepId: $stepId, isAuthenticated: $isAuthenticated)
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
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
      query ProposalTrashedListPaginatedQuery(
        $projectId: ID!
        $stepId: ID
        $count: Int
        $cursor: String
        $isAuthenticated: Boolean!
      ) {
        project: node(id: $projectId) {
          ...ProposalTrashedListPaginated_project @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
