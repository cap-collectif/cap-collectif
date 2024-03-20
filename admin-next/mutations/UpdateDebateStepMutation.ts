import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateDebateStepMutation,
  UpdateDebateStepMutation$data,
  UpdateDebateStepMutation$variables,
} from '@relay/UpdateDebateStepMutation.graphql'

const mutation = graphql`
  mutation UpdateDebateStepMutation($input: UpdateDebateStepInput!) {
    updateDebateStep(input: $input) {
      debateStep {
        title
        label
        body
        timeRange {
          startAt
          endAt
        }
        enabled
        timeless
        isAnonymousParticipationAllowed
        metaDescription
        customCode
        debateType
        debateContent
        debate {
          ...FaceToFace_debate
          id
          articles {
            edges {
              node {
                id
                url
              }
            }
          }
        }
        project {
          adminAlphaUrl
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateDebateStepMutation$variables): Promise<UpdateDebateStepMutation$data> =>
  commitMutation<UpdateDebateStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
