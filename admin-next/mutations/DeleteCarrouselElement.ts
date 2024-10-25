import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteCarrouselElementMutation,
  DeleteCarrouselElementMutation$variables,
  DeleteCarrouselElementMutation$data,
} from '@relay/DeleteCarrouselElementMutation.graphql'

const mutation = graphql`
  mutation DeleteCarrouselElementMutation($input: DeleteCarrouselElementInput!) {
    deleteCarrouselElement(input: $input) {
      deletedCarrouselElementId
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteCarrouselElementMutation$variables): Promise<DeleteCarrouselElementMutation$data> =>
  commitMutation<DeleteCarrouselElementMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
