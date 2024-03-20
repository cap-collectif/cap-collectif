import { graphql } from 'react-relay'
import { IntlShape } from 'react-intl'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DuplicateProposalFormMutation,
  DuplicateProposalFormMutation$data,
  DuplicateProposalFormMutation$variables,
} from '@relay/DuplicateProposalFormMutation.graphql'
import type { ProposalFormItem_proposalForm$data } from '@relay/ProposalFormItem_proposalForm.graphql'
import commitMutation from './commitMutation'
import { Creator, Viewer } from '../components/ProposalForm/ProposalFormItem'

const mutation = graphql`
  mutation DuplicateProposalFormMutation($input: DuplicateProposalFormInput!, $connections: [ID!]!) @raw_response_type {
    duplicateProposalForm(input: $input) {
      error
      duplicatedProposalForm @prependNode(connections: $connections, edgeTypeName: "ProposalFormEdge") {
        ...ProposalFormItem_proposalForm
      }
    }
  }
` as GraphQLTaggedNode

// @ts-ignore
const commit = (
  variables: DuplicateProposalFormMutation$variables,
  proposalFormDuplicated: ProposalFormItem_proposalForm$data,
  owner: Viewer,
  creator: Creator,
  intl: IntlShape,
): Promise<DuplicateProposalFormMutation$data> =>
  commitMutation<DuplicateProposalFormMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      duplicateProposalForm: {
        error: null,
        duplicatedProposalForm: {
          id: new Date().toISOString(),
          title: `${intl.formatMessage({ id: 'copy-of' })} ${proposalFormDuplicated.title}`,
          adminUrl: '',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString(),
          step: null,
          owner,
          // @ts-ignore fix me @alexTea
          creator,
        },
      },
    },
  })

export default { commit }
