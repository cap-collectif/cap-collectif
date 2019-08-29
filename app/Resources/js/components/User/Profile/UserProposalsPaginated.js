// @flow
import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';

import classNames from 'classnames';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import ProposalPreview from '../../Proposal/Preview/ProposalPreview';
import type { UserProposalsPaginated_user } from '~relay/UserProposalsPaginated_user.graphql';

type Props = {|
  +relay: RelayPaginationProp,
  +user: UserProposalsPaginated_user,
|};

export const PROPOSAL_PAGINATION = 50;

type State = {
  loading: boolean,
};

const classes = classNames({
  'media-list': true,
  'proposal-preview-list': true,
  opinion__list: true,
});

export class UserProposalsPaginated extends Component<Props, State> {
  state = {
    loading: false,
  };

  handleLoadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(PROPOSAL_PAGINATION, () => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { user, relay } = this.props;
    const { loading } = this.state;

    if (!user.proposals.edges || user.proposals.edges.length === 0) {
      return null;
    }

    return (
      <div>
        <Row>
          <ul className={classes}>
            {user.proposals.edges &&
              user.proposals.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((node, key) => (
                  // $FlowFixMe
                  <ProposalPreview
                    key={key}
                    // $FlowFixMe
                    proposal={node}
                    step={null}
                    viewer={null}
                  />
                ))}
          </ul>
        </Row>
        {relay.hasMore() && (
          <div className="text-center">
            {loading ? (
              <Loader />
            ) : (
              <Button bsStyle="default" onClick={this.handleLoadMore}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  UserProposalsPaginated,
  {
    user: graphql`
      fragment UserProposalsPaginated_user on User
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          stepId: { type: "ID" }
          isAuthenticated: { type: "Boolean!" }
          isProfileView: { type: "Boolean!" }
        ) {
        id
        proposals(first: $count, after: $cursor)
          @connection(key: "UserProposalsPaginated_proposals") {
          totalCount
          edges {
            node {
              id
              ...ProposalPreview_proposal
                @arguments(
                  isAuthenticated: $isAuthenticated
                  isProfileView: $isProfileView
                  stepId: $stepId
                )
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
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.user && props.user.proposals;
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
        userId: props.user.id,
      };
    },
    query: graphql`
      query UserProposalsPaginatedQuery(
        $stepId: ID!
        $userId: ID!
        $isAuthenticated: Boolean!
        $count: Int!
        $isProfileView: Boolean!
        $cursor: String
      ) {
        user: node(id: $userId) {
          id
          ...UserProposalsPaginated_user
            @arguments(
              count: $count
              isAuthenticated: $isAuthenticated
              isProfileView: $isProfileView
              stepId: $stepId
              cursor: $cursor
            )
        }
      }
    `,
  },
);
