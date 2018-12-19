// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';

import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '../../../types';
import type { ProjectListView_query } from './__generated__/ProjectListView_query.graphql';
import ProjectListViewPaginated from './ProjectListViewPaginated';
import { selector } from './Filters/ProjectListFilters';

type Props = {
  query: ProjectListView_query,
  orderBy: ?string,
  author: ?string,
  type: ?string,
  theme: ?string,
  term: ?string,
  status: ?string,
  limit: number,
  paginate: boolean,
  relay: RelayRefetchProp,
};
type State = {
  isRefetching: boolean,
};

export class ProjectListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.orderBy !== this.props.orderBy ||
      prevProps.author !== this.props.author ||
      prevProps.type !== this.props.type ||
      prevProps.theme !== this.props.theme ||
      prevProps.status !== this.props.status ||
      prevProps.term !== this.props.term
    ) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true });

    const refetchVariables = () => ({
      orderBy: { field: this.props.orderBy, direction: 'ASC' },
      author: this.props.author,
      type: this.props.type,
      theme: this.props.theme,
      limit: this.props.limit,
      term: this.props.term,
      status: this.props.status,
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
    const { query, limit, paginate } = this.props;
    const { isRefetching } = this.state;
    if (isRefetching) {
      return <Loader />;
    }
    /* $FlowFixMe */
    return <ProjectListViewPaginated query={query} limit={limit} paginate={paginate} />;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'LATEST',
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
  status: selector(state, 'status'),
  term: state.project.term,
});

const container = connect(mapStateToProps)(ProjectListView);

export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment ProjectListView_query on Query
        @argumentDefinitions(
          author: { type: "ID" }
          count: { type: "Int" }
          cursor: { type: "String" }
          theme: { type: "ID" }
          orderBy: { type: "ProjectOrder" }
          type: { type: "ID" }
          status: { type: "ID" }
          term: { type: "String" }
        ) {
        ...ProjectListViewPaginated_query
          @arguments(
            theme: $theme
            orderBy: $orderBy
            type: $type
            author: $author
            term: $term
            count: $count
            status: $status
          )
      }
    `,
  },
  graphql`
    query ProjectListViewRefetchQuery(
      $author: ID
      $count: Int
      $cursor: String
      $theme: ID
      $orderBy: ProjectOrder
      $type: ID
      $status: ID
      $term: String
    ) {
      ...ProjectListView_query
        @arguments(
          theme: $theme
          orderBy: $orderBy
          author: $author
          type: $type
          term: $term
          count: $count
          status: $status
        )
    }
  `,
);
