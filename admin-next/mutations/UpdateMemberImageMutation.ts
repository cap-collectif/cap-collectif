import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type { UpdateMemberImageMutation as Mutation } from '@relay/UpdateMemberImageMutation.graphql'

const mutation = graphql`
  mutation UpdateMemberImageMutation($input: UpdateMemberImageInput!) {
    updateMemberImage(input: $input) {
      siteImage { id isEnabled media { id name size type: contentType url(format: "default_logo") } }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: Mutation['variables']) =>
  new Promise<Mutation['response']>((resolve, reject) =>
    commitMutation<Mutation>(environment, { mutation, variables }).then(resolve, reject),
  )

export default { commit }
