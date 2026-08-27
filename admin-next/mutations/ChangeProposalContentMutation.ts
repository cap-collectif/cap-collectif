import type {
  ChangeProposalContentMutation$data,
  ChangeProposalContentMutation$variables,
  ChangeProposalContentMutation as ChangeProposalContentMutationType,
} from '@relay/ChangeProposalContentMutation.graphql'
import { ConnectionHandler, graphql, GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        id
        title
        url
        slug
        publicationStatus
        body
        summary
        category {
          id
          icon
          color
          categoryImage {
            image {
              url
            }
          }
        }
        district {
          id
        }
        theme {
          id
        }
        address {
          json
          formatted
        }
        media {
          id
          name
          url
        }
        comments {
          totalCountWithAnswers
        }
        author {
          username
          displayName
        }
        form {
          usingIllustration
        }
        responses {
          ... on ValueResponse {
            question {
              id
            }
            value
          }
          ... on MediaResponse {
            question {
              id
            }
            medias {
              id
              name
              url
            }
          }
        }
        webPageUrl
        facebookUrl
        twitterUrl
        instagramUrl
        youtubeUrl
        linkedInUrl
      }
    }
  }
` as GraphQLTaggedNode

type CommitOptions = {
  variables: ChangeProposalContentMutation$variables
  stepId: string
  wasDraft: boolean
}

const commit = ({ variables, stepId, wasDraft }: CommitOptions): Promise<ChangeProposalContentMutation$data> =>
  commitMutation<ChangeProposalContentMutationType>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      if (variables.input.draft || !wasDraft) return

      const proposal = store.getRootField('changeProposalContent')?.getLinkedRecord('proposal')
      const stepRecord = store.get(stepId)
      if (!proposal || !stepRecord) return

      const draftsConnection = stepRecord.getLinkedRecord('viewerProposalDrafts')
      if (draftsConnection) {
        const edges = draftsConnection.getLinkedRecords('edges') || []
        draftsConnection.setLinkedRecords(
          edges.filter(edge => edge?.getLinkedRecord('node')?.getDataID() !== proposal.getDataID()),
          'edges',
        )
      }

      const connectionPattern = `client:${stepId}:__ProposalsList_proposals_connection`
      const source = environment.getStore().getSource()

      for (const recordId of source.getRecordIDs()) {
        if (!recordId.startsWith(connectionPattern)) continue

        const connection = store.get(recordId)
        if (connection) {
          const edge = ConnectionHandler.createEdge(store, connection, proposal, 'ProposalEdge')
          ConnectionHandler.insertEdgeBefore(connection, edge)
        }
      }
    },
  })

export default { commit }
