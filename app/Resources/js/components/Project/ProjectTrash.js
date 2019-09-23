// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import CommentTrashedListPaginated from '../Comment/CommentTrashedListPaginated';
import ProposalTrashedListPaginated from '../Proposal/List/ProposalTrashedListPaginated';
import type { ProjectTrashQueryResponse } from '~relay/ProjectTrashQuery.graphql';

export type Props = {|
  +projectId: string,
  +isAuthenticated: boolean,
|};

export const TRASHED_PAGINATOR_COUNT = 20;

const StyledContainer = styled.div`
  .width-100 {
    width: 100%;
  }
`;

export class ProjectTrash extends React.Component<Props> {
  render() {
    const { projectId, isAuthenticated } = this.props;
    return (
      <StyledContainer>
        <div className="container width-100">
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ProjectTrashQuery(
                $projectId: ID!
                $isAuthenticated: Boolean!
                $cursor: String
                $count: Int
                $stepId: ID!
              ) {
                project: node(id: $projectId) {
                  id
                  ... on Project {
                    comments(first: $count, after: $cursor, onlyTrashed: true) {
                      totalCount
                    }
                    proposals(first: $count, after: $cursor, trashedStatus: TRASHED) {
                      totalCount
                    }
                  }
                  ...CommentTrashedListPaginated_project @arguments(count: $count, cursor: $cursor)
                  ...ProposalTrashedListPaginated_project
                    @arguments(
                      count: $count
                      cursor: $cursor
                      isAuthenticated: $isAuthenticated
                      stepId: $stepId
                    )
                }
              }
            `}
            variables={{
              projectId,
              isAuthenticated,
              count: TRASHED_PAGINATOR_COUNT,
              cursor: null,
              // TODO fixme https://github.com/cap-collectif/platform/issues/7016
              stepId: '',
            }}
            render={({
              error,
              props,
            }: {
              ...ReactRelayReadyState,
              props: ?ProjectTrashQueryResponse,
            }) => {
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
              if (
                (!project.comments || project.comments.totalCount === 0) &&
                (!project.proposals || project.proposals.totalCount === 0)
              ) {
                return (
                  <div className="project__empty-block  text-center">
                    <p className="icon  cap-bubble-attention-6" />
                    <p>
                      <FormattedMessage id="project.show.trashed.none" />
                    </p>
                  </div>
                );
              }
              return (
                <>
                  <ProposalTrashedListPaginated project={project} />
                  <CommentTrashedListPaginated project={project} />
                </>
              );
            }}
          />
        </div>
      </StyledContainer>
    );
  }
}

export default ProjectTrash;
