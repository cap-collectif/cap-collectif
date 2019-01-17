// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import CommentTrashedListPaginated from '../Comment/CommentTrashedListPaginated';

type Props = {
  projectId: string,
  isAuthenticated: Boolean,
};

export const TRASHED_COMMENT_PAGINATOR_COUNT = 20;

export class ProjectTrashComment extends React.Component<Props> {
  render() {
    const { projectId, isAuthenticated } = this.props;
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectTrashCommentQuery(
              $projectId: ID!
              $isAuthenticated: Boolean!
              $cursor: String
              $count: Int
            ) {
              project: node(id: $projectId) {
                id
                ...CommentTrashedListPaginated_project @arguments(count: $count, cursor: $cursor)
              }
            }
          `}
          variables={{
            projectId,
            isAuthenticated,
            count: TRASHED_COMMENT_PAGINATOR_COUNT,
            cursor: null,
          }}
          render={({ error, props }) => {
            if (error) {
              return graphqlError;
            }

            if (!props) {
              return <Loader />;
            }

            const { project } = props;

            if (!project) {
              return graphqlError;
            }

            return (
              /* $FlowFixMe $refType */
              <CommentTrashedListPaginated project={props.project} />
            );
          }}
        />
      </div>
    );
  }
}

export default ProjectTrashComment;
