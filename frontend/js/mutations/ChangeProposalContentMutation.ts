// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  ChangeProposalContentMutationVariables,
  ChangeProposalContentMutationResponse,
} from '~relay/ChangeProposalContentMutation.graphql'

const mutation = graphql`
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!, $proposalRevisionsEnabled: Boolean!) {
    changeProposalContent(input: $input) {
      proposal {
        ...ProposalEditModal_proposal @arguments(proposalRevisionsEnabled: false)
        ...ProposalRevision_proposal @include(if: $proposalRevisionsEnabled)
        id
        title
        body
        summary
        publicationStatus
        estimation
        likers {
          id
          displayName
        }
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
          ... on MediaResponse {
            medias {
              id
              name
              size
              url
            }
          }
        }
        media {
          id
          url
        }
        author {
          id
          displayName
        }
        theme {
          id
        }
        category {
          id
        }
        address {
          json
          formatted
          lat
          lng
        }
        district {
          id
        }
        twitterUrl
        webPageUrl
        facebookUrl
        instagramUrl
        linkedInUrl
        youtubeUrl
      }
    }
  }
`

const commit = (
  variables: ChangeProposalContentMutationVariables,
  uploadables: any = undefined,
): Promise<ChangeProposalContentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    uploadables,
    variables,
  })

export default {
  commit,
}
