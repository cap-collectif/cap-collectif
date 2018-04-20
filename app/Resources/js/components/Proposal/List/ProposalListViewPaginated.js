// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProposalListViewPaginated_step } from './__generated__/ProposalListViewPaginated_step.graphql';
import type { ProposalListViewPaginated_viewer } from './__generated__/ProposalListViewPaginated_viewer.graphql';
import VisibilityBox from '../../Utils/VisibilityBox';
import ProposalList from './ProposalList';

type Props = {
  term: ?string,
  order: string,
  relay: RelayPaginationProp,
  step: ProposalListViewPaginated_step,
  viewer: ?ProposalListViewPaginated_viewer,
};

export class ProposalListViewPaginated extends React.Component<Props> {
  render() {
    const { step, viewer, relay } = this.props;

    // $FlowFixMe
    const proposals = step.proposals || step.form.proposals;

    return (
      <div>
        <VisibilityBox enabled={step.private || false}>
          {/* $FlowFixMe */}
          <ProposalList step={step} proposals={proposals} viewer={viewer} id="proposals-list" />
        </VisibilityBox>
        <div id="proposal-list-pagination-footer">
          <Button
            onClick={() => {
              relay.loadMore(30);
            }}>
            Load More
          </Button>
        </div>
      </div>
    );
  }
}

// TODO refacto to have only one @connection for collect and selection
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
        ...ProposalList_step
        # ... on CollectStep {
        #   private
        #   form {
        #     proposals(
        #       first: $count
        #       orderBy: $orderBy
        #       term: $term
        #       district: $district
        #       theme: $theme
        #       category: $category
        #       status: $status
        #       userType: $userType
        #     ) @connection(key: "ProposalListViewPaginated_proposals") {
        #       ...ProposalList_proposals
        #       edges {
        #         node {
        #           id
        #         }
        #       }
        #     }
        #   }
        # }
        proposals(
          first: $count
          orderBy: $orderBy
          term: $term
          district: $district
          theme: $theme
          category: $category
          status: $status
          userType: $userType
        ) @connection(key: "ProposalListViewPaginated_proposals") {
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
        }
      }
    `,
  },
);
