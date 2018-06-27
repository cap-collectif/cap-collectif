// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import type { ArgumentListView_argumentable } from './__generated__/ArgumentListView_argumentable.graphql';
import Loader from '../Ui/Loader';
import ArgumentListViewPaginated from './ArgumentListViewPaginated';

type Props = {
  order: string,
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
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true });

    const refetchVariables = fragmentVariables => ({
      argumentableId: this.props.argumentable.id,
      count: fragmentVariables.count,
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
        @argumentDefinitions(count: { type: "Int" }) {
        ... on Node {
          id
        }
        ...ArgumentListViewPaginated_argumentable
      }
    `,
  },
  graphql`
    query ArgumentListViewRefetchQuery(
      $type: ArgumentValue
      $isAuthenticated: Boolean!
      $argumentableId: ID!
      $cursor: String
      $orderBy: ArgumentOrder
      $count: Int
    ) {
      argumentable: node(id: $argumentableId) {
        id
        ...ArgumentListView_argumentable
      }
    }
  `,
);
