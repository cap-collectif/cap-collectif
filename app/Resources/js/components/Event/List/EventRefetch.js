// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { type MapStateToProps, connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import EventListPaginated from './EventListPaginated';
import type { GlobalState } from '../../../types';
import type EventRefetch_query from './__generated__/EventRefetch_query.graphql';

type Props = {
  search: ?string,
  relay: RelayRefetchProp,
  query: EventRefetch_query,
  theme: ?string,
  project: ?string,
};

type State = {
  isRefetching: boolean,
};

export class EventRefetch extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.theme !== this.props.theme ||
      prevProps.project !== this.props.project ||
      prevProps.search !== this.props.search
    ) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true });

    const refetchVariables = fragmentVariables => ({
      count: fragmentVariables.count,
      cursor: null,
      search: this.props.search || null,
      theme: this.props.theme || null,
      project: this.props.project || null,
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
    const { query } = this.props;

    if (this.state.isRefetching) {
      return <Loader />;
    }

    return <EventListPaginated query={query} />;
  }
}

const selector = formValueSelector('EventListFilters');

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  theme: selector(state, 'theme'),
  project: selector(state, 'project'),
  search: selector(state, 'search'),
});

const container = connect(mapStateToProps)(EventRefetch);

export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment EventRefetch_query on Query
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          theme: { type: "ID" }
          project: { type: "ID" }
          search: { type: "String" }
          isFuture: { type: "Boolean" }
        ) {
        ...EventListPaginated_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            search: $search
            isFuture: $isFuture
          )
        ...EventPageHeader_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            search: $search
            isFuture: $isFuture
          )
      }
    `,
  },
  graphql`
    query EventRefetchRefetchQuery(
      $cursor: String
      $count: Int
      $theme: ID
      $project: ID
      $search: String
      $isFuture: Boolean
    ) {
      ...EventRefetch_query
        @arguments(
          cursor: $cursor
          count: $count
          theme: $theme
          project: $project
          search: $search
          isFuture: $isFuture
        )
    }
  `,
);
