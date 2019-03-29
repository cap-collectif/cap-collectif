// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import type { ArgumentListView_argumentable } from './__generated__/ArgumentListView_argumentable.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ArgumentListViewPaginated from './ArgumentListViewPaginated';

export type ArgumentOrder = 'old' | 'last' | 'popular';

type Props = {
  order: ArgumentOrder,
  relay: RelayRefetchProp,
  argumentable: ArgumentListView_argumentable,
};

type State = {
  isRefetching: boolean,
};

export class ArgumentListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.order !== this.props.order) {
      this._refetch(this.props.order);
    }
  }

  _refetch = (newOrder: ArgumentOrder) => {
    this.setState({ isRefetching: true });

    const direction = newOrder === 'old' ? 'ASC' : 'DESC';
    const field = newOrder === 'popular' ? 'VOTES' : 'PUBLISHED_AT';

    const orderBy = {
      direction,
      field,
    };

    const refetchVariables = fragmentVariables => ({
      argumentableId: this.props.argumentable.id,
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
    const { argumentable } = this.props;

    if (this.state.isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe
    return <ArgumentListViewPaginated argumentable={argumentable} />;
  }
}

export default createRefetchContainer(
  ArgumentListView,
  {
    argumentable: graphql`
      fragment ArgumentListView_argumentable on Argumentable
        @argumentDefinitions(
          isAuthenticated: { type: "Boolean!" }
          count: { type: "Int!", defaultValue: 25 }
          cursor: { type: "String", defaultValue: null }
          type: { type: "ArgumentValue!", nonNull: true }
          orderBy: { type: "ArgumentOrder", defaultValue: { field: PUBLISHED_AT, direction: DESC } }
        ) {
        id
        ...ArgumentListViewPaginated_argumentable
          @arguments(
            isAuthenticated: $isAuthenticated
            cursor: $cursor
            count: $count
            orderBy: $orderBy
            type: $type
          )
      }
    `,
  },
  graphql`
    query ArgumentListViewRefetchQuery(
      $type: ArgumentValue!
      $isAuthenticated: Boolean!
      $argumentableId: ID!
      $cursor: String
      $orderBy: ArgumentOrder
      $count: Int
    ) {
      argumentable: node(id: $argumentableId) {
        id
        ...ArgumentListView_argumentable
          @arguments(
            cursor: $cursor
            count: $count
            type: $type
            orderBy: $orderBy
            isAuthenticated: $isAuthenticated
          )
      }
    }
  `,
);
