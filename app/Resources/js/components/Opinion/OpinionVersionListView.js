// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import Loader from '../Ui/Loader';
import OpinionVersionListViewPaginated from './OpinionVersionListViewPaginated';
import type { OpinionVersionListView_opinion } from './__generated__/OpinionVersionListView_opinion.graphql';

export type VersionOrder = 'old' | 'last' | 'popular';

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
    if (prevProps.order !== this.props.order) {
      this._refetch(this.props.order);
    }
  }

  _refetch = (newOrder: VersionOrder) => {
    this.setState({ isRefetching: true });

    const direction = newOrder === 'old' ? 'ASC' : 'DESC';
    const field = newOrder === 'popular' ? 'VOTES' : 'CREATED_AT';

    const orderBy = {
      direction,
      field,
    };

    const refetchVariables = fragmentVariables => ({
      opinionId: this.props.opinion.id,
      count: fragmentVariables.count,
      cursor: null,
      orderBy,
    });

    this.props.relay.refetch(
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

    if (this.state.isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe
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
