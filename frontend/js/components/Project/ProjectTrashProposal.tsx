import * as React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '../../createRelayEnvironment'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import ProposalTrashedListPaginated, {
  TRASHED_PROPOSAL_PAGINATOR_COUNT,
} from '../Proposal/List/ProposalTrashedListPaginated'
import type {
  ProjectTrashProposalQueryResponse,
  ProjectTrashProposalQueryVariables,
} from '~relay/ProjectTrashProposalQuery.graphql'
export type Props = {
  readonly projectId: string
  readonly isAuthenticated: boolean
}
export class ProjectTrashProposal extends React.Component<Props> {
  render() {
    const { projectId, isAuthenticated } = this.props
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectTrashProposalQuery(
              $projectId: ID!
              $stepId: ID!
              $isAuthenticated: Boolean!
              $cursor: String
              $count: Int
            ) {
              project: node(id: $projectId) {
                ...ProposalTrashedListPaginated_project
                  @arguments(count: $count, cursor: $cursor, isAuthenticated: $isAuthenticated, stepId: $stepId)
              }
            }
          `}
          variables={
            {
              projectId,
              isAuthenticated,
              count: TRASHED_PROPOSAL_PAGINATOR_COUNT,
              cursor: null,
              // TODO fixme https://github.com/cap-collectif/platform/issues/7016
              stepId: '',
            } as ProjectTrashProposalQueryVariables
          }
          render={({
            error,
            props,
          }: ReactRelayReadyState & {
            props: ProjectTrashProposalQueryResponse | null | undefined
          }) => {
            if (error) {
              return graphqlError
            }

            if (!props) {
              return <Loader />
            }

            const { project } = props

            if (!project) {
              return graphqlError
            }

            return <ProposalTrashedListPaginated project={project} />
          }}
        />
      </div>
    )
  }
}
export default ProjectTrashProposal
