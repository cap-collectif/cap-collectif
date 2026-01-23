import type {
  CreateProposalMutation$data,
  CreateProposalMutation$variables,
  CreateProposalMutation as CreateProposalMutationType,
} from '@relay/CreateProposalMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from '@utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!, $connections: [ID!]!, $stepId: ID!) {
    createProposal(input: $input) {
      proposal @prependNode(connections: $connections, edgeTypeName: "ProposalEdge") {
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
          ranking
        }
        estimation
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateProposalMutation$variables): Promise<CreateProposalMutation$data> =>
  commitMutation<CreateProposalMutationType>(environment, {
    mutation,
    variables,
  })

export default { commit }
