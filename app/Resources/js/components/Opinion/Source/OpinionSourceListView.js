// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import OpinionSourceListViewPaginated from './OpinionSourceListViewPaginated';
import type { OpinionSourceListView_sourceable } from './__generated__/OpinionSourceListView_sourceable.graphql';

export type OpinionSourceOrder = 'old' | 'last' | 'popular';

type Props = {
  order: OpinionSourceOrder,
  relay: RelayRefetchProp,
  sourceable: OpinionSourceListView_sourceable,
};

type State = {
  isRefetching: boolean,
};

export class OpinionSourceListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.order !== this.props.order) {
      this._refetch(this.props.order);
    }
  }

  _refetch = (newOrder: OpinionSourceOrder) => {
    this.setState({ isRefetching: true });

    const direction = newOrder === 'old' ? 'ASC' : 'DESC';
    const field = newOrder === 'popular' ? 'VOTES' : 'PUBLISHED_AT';

    const orderBy = {
      direction,
      field,
    };

    const refetchVariables = fragmentVariables => ({
      sourceableId: this.props.sourceable.id,
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
    const { sourceable } = this.props;

    if (this.state.isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe
    return <OpinionSourceListViewPaginated sourceable={sourceable} />;
  }
}

export default createRefetchContainer(
  OpinionSourceListView,
  {
    sourceable: graphql`
      fragment OpinionSourceListView_sourceable on Sourceable
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: { type: "SourceOrder!" }
        ) {
        id
        ...OpinionSourceListViewPaginated_sourceable
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
    query OpinionSourceListViewRefetchQuery(
      $isAuthenticated: Boolean!
      $sourceableId: ID!
      $cursor: String
      $orderBy: SourceOrder!
      $count: Int!
    ) {
      sourceable: node(id: $sourceableId) {
        id
        ...OpinionSourceListView_sourceable
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
