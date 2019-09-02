// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProposalTrashedListPaginated from '../Proposal/List/ProposalTrashedListPaginated';
import type {
  ProjectTrashProposalQueryResponse,
  ProjectTrashProposalQueryVariables,
} from '~relay/ProjectTrashProposalQuery.graphql';

export type Props = {|
  +projectId: string,
  +isAuthenticated: boolean,
|};

export const TRASHED_PROPOSAL_PAGINATOR_COUNT = 20;

export class ProjectTrashProposal extends React.Component<Props> {
  render() {
    const { projectId, isAuthenticated } = this.props;
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectTrashProposalQuery(
              $projectId: ID!
              $stepId: ID
              $isAuthenticated: Boolean!
              $cursor: String
              $count: Int
            ) {
              project: node(id: $projectId) {
                id
                ...ProposalTrashedListPaginated_project @arguments(count: $count, cursor: $cursor)
              }
            }
          `}
          variables={
            ({
              projectId,
              isAuthenticated,
              count: TRASHED_PROPOSAL_PAGINATOR_COUNT,
              cursor: null,
            }: ProjectTrashProposalQueryVariables)
          }
          render={({
            error,
            props,
          }: {
            props?: ?ProjectTrashProposalQueryResponse,
            ...ReactRelayReadyState,
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

            return <ProposalTrashedListPaginated project={props.project} />;
          }}
        />
      </div>
    );
  }
}

export default ProjectTrashProposal;
