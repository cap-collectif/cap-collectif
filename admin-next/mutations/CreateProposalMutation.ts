import type {
  CreateProposalMutation$data,
  CreateProposalMutation$variables,
  CreateProposalMutation as CreateProposalMutationType,
} from '@relay/CreateProposalMutation.graphql'
import { environment } from '@utils/relay-environement'
import { graphql } from 'react-relay'
import { ConnectionHandler, GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!, $stepId: ID!, $isAuthenticated: Boolean!) {
    createProposal(input: $input) {
      proposal {
        id
        title
        url
        slug
        reference
        publicationStatus
        media {
          url
        }
        body
        summary
        category {
          icon
          color
          categoryImage {
            image {
              url
            }
          }
        }
        comments {
          totalCount
        }
        author {
          username
        }
        viewerVote(step: $stepId) {
          id
          ranking
          completionStatus
        }
        viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
        votes {
          totalCount
        }
        paperVotesTotalCount
        estimation
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

type CommitOptions = {
  variables: CreateProposalMutation$variables
  stepId: string
}

const commit = ({ variables, stepId }: CommitOptions): Promise<CreateProposalMutation$data> =>
  commitMutation<CreateProposalMutationType>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createProposal')
      if (!payload) return

      const newProposal = payload.getLinkedRecord('proposal')
      if (!newProposal) return

      const stepRecord = store.get(stepId)
      if (!stepRecord) return

      if (newProposal.getValue('publicationStatus') === 'DRAFT') {
        // For drafts, update viewerProposalDrafts
        const draftsConnection = stepRecord.getLinkedRecord('viewerProposalDrafts')
        if (draftsConnection) {
          const existingEdges = draftsConnection.getLinkedRecords('edges') || []
          const newEdge = store.create(`client:newDraftEdge:${newProposal.getDataID()}`, 'ProposalEdge')
          newEdge.setLinkedRecord(newProposal, 'node')
          draftsConnection.setLinkedRecords([newEdge, ...existingEdges], 'edges')
        }
      } else {
        // For published proposals, add to the proposals connection
        const connectionPattern = `client:${stepId}:__ProposalsList_proposals_connection`
        const source = environment.getStore().getSource()
        const recordIds = source.getRecordIDs()

        for (const recordId of recordIds) {
          if (recordId.startsWith(connectionPattern)) {
            const connection = store.get(recordId)
            if (connection) {
              const edge = ConnectionHandler.createEdge(store, connection, newProposal, 'ProposalEdge')
              ConnectionHandler.insertEdgeBefore(connection, edge)
            }
          }
        }
      }
    },
  })

export default { commit }
