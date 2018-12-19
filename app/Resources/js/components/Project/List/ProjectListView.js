// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';

import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '../../../types';
import type { ProjectListView_query } from './__generated__/ProjectListView_query.graphql';
import ProjectListViewPaginated from './ProjectListViewPaginated';

type Props = {
  query: ProjectListView_query,
  orderBy: ?string,
  type: ?string,
  theme: ?string,
  term: ?string,
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
      prevProps.type !== this.props.type ||
      prevProps.theme !== this.props.theme ||
      prevProps.term !== this.props.term
    ) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true });

    const refetchVariables = () => ({
      orderBy: { field: this.props.orderBy, direction: 'ASC' },
      type: this.props.type,
      theme: this.props.theme,
      limit: this.props.limit,
      term: this.props.term,
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
  theme: state.project.theme,
  orderBy: state.project.orderBy || 'LATEST',
  type: state.project.type,
  term: state.project.term,
});

const container = connect(mapStateToProps)(ProjectListView);

export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment ProjectListView_query on Query
        @argumentDefinitions(
          count: { type: "Int" }
          cursor: { type: "String" }
          theme: { type: "ID" }
          orderBy: { type: "ProjectOrder" }
          type: { type: "ID" }
          term: { type: "String" }
        ) {
        ...ProjectListViewPaginated_query
          @arguments(theme: $theme, orderBy: $orderBy, type: $type, term: $term, count: $count)
      }
    `,
  },
  graphql`
    query ProjectListViewRefetchQuery(
      $count: Int
      $cursor: String
      $theme: ID
      $orderBy: ProjectOrder
      $type: ID
      $term: String
    ) {
      ...ProjectListView_query
        @arguments(theme: $theme, orderBy: $orderBy, type: $type, term: $term, count: $count)
    }
  `,
);
