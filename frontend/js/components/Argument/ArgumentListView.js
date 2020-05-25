// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import type { ArgumentListView_argumentable } from '~relay/ArgumentListView_argumentable.graphql';
import type {
  ArgumentOrder,
  ArgumentValue,
  ArgumentListViewRefetchQueryVariables,
} from '~relay/ArgumentListViewRefetchQuery.graphql';

import Loader from '../Ui/FeedbacksIndicators/Loader';
import ArgumentListViewPaginated from './ArgumentListViewPaginated';
import type { ArgumentType } from '../../types';

export type ArgumentSelectOrder = 'old' | 'last' | 'popular';

type Props = {|
  +order: ArgumentSelectOrder,
  +relay: RelayRefetchProp,
  +argumentable: ArgumentListView_argumentable,
  +type: ArgumentType,
|};

type State = {|
  +isRefetching: boolean,
|};

export type FragmentVariables = {|
  type: ArgumentValue,
  isAuthenticated: boolean,
  cursor?: ?string,
  orderBy: ArgumentOrder,
  count: number,
|};

export class ArgumentListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    const { order } = this.props;

    if (prevProps.order !== order) {
      this._refetch(order);
    }
  }

  _refetch = (newOrder: ArgumentSelectOrder) => {
    const { argumentable, relay } = this.props;

    this.setState({ isRefetching: true });

    const direction = newOrder === 'old' ? 'ASC' : 'DESC';
    const field = newOrder === 'popular' ? 'VOTES' : 'PUBLISHED_AT';

    const orderBy: ArgumentOrder = {
      direction,
      field,
    };

    const refetchVariables = (fragmentVariables: FragmentVariables) =>
      ({
        argumentableId: argumentable.id,
        count: fragmentVariables.count,
        isAuthenticated: fragmentVariables.isAuthenticated,
        type: fragmentVariables.type,
        cursor: null,
        orderBy,
      }: ArgumentListViewRefetchQueryVariables);

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
    const { argumentable, type } = this.props;
    const { isRefetching } = this.state;

    if (isRefetching) {
      return <Loader />;
    }

    return <ArgumentListViewPaginated argumentable={argumentable} type={type} />;
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
          cursor: { type: "String" }
          type: { type: "ArgumentValue!" }
          orderBy: { type: "ArgumentOrder!" }
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
      $orderBy: ArgumentOrder!
      $count: Int!
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
