// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { debounce } from 'lodash';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import EventListPaginated from './EventListPaginated';
import { graphqlError } from '../../../createRelayEnvironment';
import type { GlobalState } from '../../../types';
import type { EventRefetch_query } from '~relay/EventRefetch_query.graphql';

type Props = {
  search: ?string,
  relay: RelayRefetchProp,
  query: EventRefetch_query,
  theme: ?string,
  project: ?string,
  userType: ?string,
  status: ?boolean,
  isRegistrable: ?string,
  author: ?{ value: string },
};

type State = {
  isRefetching: boolean,
  hasRefetchError: boolean,
};

export class EventRefetch extends React.Component<Props, State> {
  state = {
    isRefetching: false,
    hasRefetchError: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.theme !== this.props.theme ||
      prevProps.project !== this.props.project ||
      prevProps.search !== this.props.search ||
      prevProps.status !== this.props.status ||
      prevProps.userType !== this.props.userType ||
      prevProps.author !== this.props.author ||
      prevProps.isRegistrable !== this.props.isRegistrable
    ) {
      this._refetch();
    }
  }

  _refetch = debounce(() => {
    this.setState({ isRefetching: true });

    const refetchVariables = fragmentVariables => ({
      count: fragmentVariables.count,
      cursor: null,
      search: this.props.search || null,
      theme: this.props.theme || null,
      project: this.props.project || null,
      userType: this.props.userType || null,
      isFuture: this.props.status === 'all' ? null : this.props.status === 'ongoing-and-future',
      author: this.props.author && this.props.author.value ? this.props.author.value : null,
      isRegistrable:
        this.props.isRegistrable === 'all' || typeof this.props.isRegistrable === 'undefined'
          ? null
          : this.props.isRegistrable === 'yes',
    });

    this.props.relay.refetch(
      refetchVariables,
      null,
      error => {
        if (error) {
          this.setState({ hasRefetchError: true });
        }
        this.setState({ isRefetching: false });
      },
      { force: true },
    );
  }, 500);

  render() {
    const { query } = this.props;

    if (this.state.hasRefetchError) {
      return graphqlError;
    }

    if (this.state.isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe Flow failed to infer redux's dispatch
    return <EventListPaginated query={query} />;
  }
}

const selector = formValueSelector('EventPageContainer');

const mapStateToProps = (state: GlobalState) => ({
  theme: selector(state, 'theme'),
  project: selector(state, 'project'),
  search: selector(state, 'search'),
  userType: selector(state, 'userType'),
  status: selector(state, 'status'),
  author: selector(state, 'author'),
  isRegistrable: selector(state, 'isRegistrable'),
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
          userType: { type: "ID" }
          isFuture: { type: "Boolean" }
          author: { type: "ID" }
          isRegistrable: { type: "Boolean" }
        ) {
        ...EventListPaginated_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
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
      $userType: ID
      $search: String
      $isFuture: Boolean
      $author: ID
      $isRegistrable: Boolean
    ) {
      ...EventRefetch_query
        @arguments(
          cursor: $cursor
          count: $count
          theme: $theme
          project: $project
          userType: $userType
          search: $search
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
        )
      events(
        first: $count
        after: $cursor
        theme: $theme
        project: $project
        search: $search
        userType: $userType
        isFuture: $isFuture
        author: $author
        isRegistrable: $isRegistrable
      ) @connection(key: "EventListPaginated_events", filters: []) {
        edges {
          node {
            id
          }
        }
        totalCount
      }
    }
  `,
);
