// @flow
import * as React from 'react';
import { createRefetchContainer, graphql, type RelayRefetchProp } from 'react-relay';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import CommentTrashedListPaginated from './CommentTrashedListPaginated';
import { TRASHED_COMMENT_PAGINATOR_COUNT } from '../Project/ProjectTrashComment';

type Props = {
  project: Object,
  isAuthenticated: boolean,
  relay: RelayRefetchProp,
};

type State = {
  isRefetching: boolean,
};

export class CommentTrashedList extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  };

  _refetch = () => {
    this.setState({ isRefetching: true });
    const { project, isAuthenticated, relay } = this.props;

    const refetchVariables = () => ({
      projectId: project.id,
      isAuthenticated,
      count: TRASHED_COMMENT_PAGINATOR_COUNT,
    });

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
    const { isRefetching } = this.state;
    if (isRefetching) {
      return <Loader />;
    }

    const { project } = this.props;

    return (
      // $FlowFixMe
      <CommentTrashedListPaginated project={project} />
    );
  }
}

export default createRefetchContainer(
  CommentTrashedList,
  {
    project: graphql`
      fragment CommentTrashedList_project on Project
        @argumentDefinitions(count: { type: "Int" }, cursor: { type: "String" }) {
        id
        ...CommentTrashedListPaginated_project
      }
    `,
  },
  graphql`
    query CommentTrashedListRefetchQuery(
      $projectId: ID!
      $cursor: String
      $isAuthenticated: Boolean!
      $count: Int
    ) {
      project: node(id: $projectId) {
        id
        ...CommentTrashedList_project
      }
    }
  `,
);
