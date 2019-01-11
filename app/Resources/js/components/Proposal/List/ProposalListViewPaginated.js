// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProposalListViewPaginated_step } from './__generated__/ProposalListViewPaginated_step.graphql';
import type { ProposalListViewPaginated_viewer } from './__generated__/ProposalListViewPaginated_viewer.graphql';
import VisibilityBox from '../../Utils/VisibilityBox';
import ProposalList from './ProposalList';

type Props = {
  relay: RelayPaginationProp,
  step: ProposalListViewPaginated_step,
  view: 'mosaic' | 'table',
  viewer: ?ProposalListViewPaginated_viewer,
};
type State = {
  loading: boolean,
};

export class ProposalListViewPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { step, viewer, relay, view } = this.props;
    return (
      <div>
        <VisibilityBox enabled={step.private || false}>
          {/* $FlowFixMe */}
          <ProposalList
            step={step}
            proposals={step.proposals}
            viewer={viewer}
            view={view}
            id="proposals-list"
          />
        </VisibilityBox>
        <div id="proposal-list-pagination-footer" className="text-center">
          {relay.hasMore() && (
            <Button
              disabled={this.state.loading}
              onClick={() => {
                this.setState({ loading: true });
                relay.loadMore(50, () => {
                  this.setState({ loading: false });
                });
              }}>
              <FormattedMessage id="see-more-proposals" />
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default createPaginationContainer(
  ProposalListViewPaginated,
  {
    viewer: graphql`
      fragment ProposalListViewPaginated_viewer on User {
        ...ProposalList_viewer
      }
    `,
    step: graphql`
      fragment ProposalListViewPaginated_step on ProposalStep {
        id
        ... on CollectStep {
          private
        }
        ...ProposalList_step
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          district: $district
          theme: $theme
          category: $category
          status: $status
          userType: $userType
        ) @connection(key: "ProposalListViewPaginated_proposals", filters: []) {
          totalCount
          ...ProposalList_proposals
          edges {
            node {
              id
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
      return props.step && props.step.proposals;
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
        stepId: props.step.id,
        isAuthenticated: !!props.viewer,
      };
    },
    query: graphql`
      query ProposalListViewPaginatedQuery(
        $stepId: ID!
        $cursor: String
        $orderBy: ProposalOrder
        $isAuthenticated: Boolean!
        $count: Int
        $term: String
        $district: ID
        $category: ID
        $status: ID
        $theme: ID
        $userType: ID
      ) {
        step: node(id: $stepId) {
          ...ProposalListViewPaginated_step
          ...ProposalStepPageHeader_step
        }
      }
    `,
  },
);
