// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import OpinionVersionListViewPaginated from './OpinionVersionListViewPaginated';
import type { OpinionVersionListView_opinion } from '~relay/OpinionVersionListView_opinion.graphql';

export type VersionOrder = 'old' | 'last' | 'votes' | 'favorable' | 'comments' | 'random';

type Props = {
  order: VersionOrder,
  relay: RelayRefetchProp,
  opinion: OpinionVersionListView_opinion,
};

type State = {
  isRefetching: boolean,
};

export class OpinionVersionListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    const { order } = this.props;

    if (prevProps.order !== order) {
      this._refetch(order);
    }
  }

  _refetch = (newOrder: VersionOrder) => {
    const { opinion, relay } = this.props;

    this.setState({ isRefetching: true });

    let direction = 'DESC';
    let field = 'PUBLISHED_AT';
    switch (newOrder) {
      case 'old':
        direction = 'ASC';
        break;
      case 'last':
        direction = 'DESC';
        break;
      case 'favorable':
        field = 'VOTES_OK';
        direction = 'DESC';
        break;
      case 'votes':
        field = 'VOTES';
        direction = 'DESC';
        break;
      case 'comments':
        field = 'ARGUMENTS';
        direction = 'DESC';
        break;
      case 'random':
        field = 'RANDOM';
        direction = 'DESC';
        break;
      default:
        break;
    }
    const orderBy = {
      direction,
      field,
    };

    const refetchVariables = fragmentVariables => ({
      opinionId: opinion.id,
      count: fragmentVariables.count,
      cursor: null,
      orderBy,
    });

    relay.refetch(
      refetchVariables,
      null,
      () => {
        this.setState({ isRefetching: false });
      },
      { force: true },
    );
  };

  render() {
    const { opinion } = this.props;
    const { isRefetching } = this.state;

    if (isRefetching) {
      return <Loader />;
    }

    return <OpinionVersionListViewPaginated opinion={opinion} />;
  }
}

export default createRefetchContainer(
  OpinionVersionListView,
  {
    opinion: graphql`
      fragment OpinionVersionListView_opinion on Sourceable
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "VersionOrder!" }
        ) {
        id
        ...OpinionVersionListViewPaginated_opinion
          @arguments(
            isAuthenticated: $isAuthenticated
            cursor: $cursor
            count: $count
            orderBy: $orderBy
          )
      }
    `,
  },
  graphql`
    query OpinionVersionListViewRefetchQuery(
      $isAuthenticated: Boolean!
      $opinionId: ID!
      $cursor: String
      $orderBy: VersionOrder!
      $count: Int!
    ) {
      opinion: node(id: $opinionId) {
        id
        ...OpinionVersionListView_opinion
          @arguments(
            isAuthenticated: $isAuthenticated
            cursor: $cursor
            count: $count
            orderBy: $orderBy
          )
      }
    }
  `,
);
