// @flow
import * as React from 'react';
import { createRefetchContainer, graphql, type RelayRefetchProp } from 'react-relay';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { debounce } from 'lodash';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import EventListPaginated from './EventListPaginated';
import { graphqlError } from '../../../createRelayEnvironment';
import type { GlobalState } from '../../../types';
import type { EventRefetch_query } from '~relay/EventRefetch_query.graphql';
import type { EventOrder } from '~relay/HomePageEventsQuery.graphql';
import { getOrderBy } from '../Profile/EventListProfileRefetch';

type Props = {|
  +search: ?string,
  +relay: RelayRefetchProp,
  +query: EventRefetch_query,
  +theme: ?string,
  +project: ?string,
  +userType: ?string,
  +status: ?boolean,
  +isRegistrable: ?string,
  +author: ?{ value: string },
  +orderBy: EventOrder,
|};

type State = {|
  +isRefetching: boolean,
  +hasRefetchError: boolean,
|};

export class EventRefetch extends React.Component<Props, State> {
  state = {
    isRefetching: false,
    hasRefetchError: false,
  };

  _refetch = debounce(() => {
    const { relay, search, project, theme, author, status, isRegistrable, userType } = this.props;
    this.setState({ isRefetching: true });
    const refetchVariables = fragmentVariables => ({
      count: fragmentVariables.count,
      cursor: null,
      search: search || null,
      theme: theme || null,
      project: project || null,
      userType: userType || null,
      isFuture: status === 'all' ? null : status === 'ongoing-and-future',
      author: author && author.value ? author.value : null,
      isRegistrable:
        isRegistrable === 'all' || typeof isRegistrable === 'undefined'
          ? null
          : isRegistrable === 'yes',
      orderBy: status === 'finished' || status === 'all' ? getOrderBy('old') : getOrderBy('new'),
    });

    relay.refetch(
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

  componentDidUpdate(prevProps: Props) {
    const { search, project, theme, orderBy, author, status, isRegistrable, userType } = this.props;
    if (
      prevProps.theme !== theme ||
      prevProps.project !== project ||
      prevProps.search !== search ||
      prevProps.status !== status ||
      prevProps.userType !== userType ||
      prevProps.author !== author ||
      prevProps.isRegistrable !== isRegistrable ||
      prevProps.orderBy !== orderBy
    ) {
      this._refetch();
    }
  }

  render() {
    const { query } = this.props;
    const { isRefetching, hasRefetchError } = this.state;

    if (hasRefetchError) {
      return graphqlError;
    }

    if (isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe Flow failed to infer redux's dispatch
    return <EventListPaginated query={query} />;
  }
}

const mapStateToProps = (state: GlobalState) => {
  const selector = formValueSelector('EventPageContainer');
  return {
    theme: selector(state, 'theme'),
    project: selector(state, 'project'),
    search: selector(state, 'search'),
    userType: selector(state, 'userType'),
    status: selector(state, 'status'),
    author: selector(state, 'author'),
    isRegistrable: selector(state, 'isRegistrable'),
    orderBy: selector(state, 'orderBy'),
  };
};

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
          orderBy: { type: "EventOrder" }
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
            orderBy: $orderBy
          )
      }
    `,
  },
  graphql`
    query EventRefetchRefetchQuery(
      $cursor: String
      $count: Int!
      $theme: ID
      $project: ID
      $userType: ID
      $search: String
      $isFuture: Boolean
      $author: ID
      $isRegistrable: Boolean
      $orderBy: EventOrder
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
          orderBy: $orderBy
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
        orderBy: $orderBy
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
