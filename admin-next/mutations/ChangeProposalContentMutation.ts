import type {
  ChangeProposalContentMutation$data,
  ChangeProposalContentMutation$variables,
  ChangeProposalContentMutation as ChangeProposalContentMutationType,
} from '@relay/ChangeProposalContentMutation.graphql'
import { graphql, GraphQLTaggedNode } from 'relay-runtime'
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

const commit = (variables: ChangeProposalContentMutation$variables): Promise<ChangeProposalContentMutation$data> =>
  commitMutation<ChangeProposalContentMutationType>(environment, {
    mutation,
    variables,
  })

export default { commit }
