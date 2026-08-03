/* eslint-env jest */
import '../../../_setupDB'

const select = /* GraphQL */ `
  mutation SelectProposalMutation($input: SelectProposalInput!) {
    selectProposal(input: $input) {
      proposal {
        selections {
          step {
            id
          }
          status {
            id
          }
        }
      }
    }
  }
`

const unselect = /* GraphQL */ `
  mutation UnselectProposalMutation($input: UnselectProposalInput!) {
    unselectProposal(input: $input) {
      proposal {
        selections {
          step {
            id
          }
          status {
            id
          }
        }
      }
    }
  }
`

const proposalId = 'UHJvcG9zYWw6cHJvcG9zYWw4' // Proposal:proposal8
const stepId = 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==' // SelectionStep:selectionstep1

describe('Internal|select proposal', () => {
  it('selects a proposal without a status', async () => {
    const response = await graphql(select, { input: { proposalId, stepId, statusId: null } }, 'internal_admin')

    expect(response.selectProposal.proposal.selections).toContainEqual({ step: { id: stepId }, status: null })
  })

  it('selects a proposal with a status then unselects it', async () => {
    const selected = await graphql(select, { input: { proposalId, stepId, statusId: 'status1' } }, 'internal_admin')
    expect(selected.selectProposal.proposal.selections).toContainEqual({
      step: { id: stepId },
      status: { id: 'status1' },
    })

    const unselected = await graphql(unselect, { input: { proposalId, stepId } }, 'internal_admin')
    expect(unselected.unselectProposal.proposal.selections).not.toContainEqual(
      expect.objectContaining({ step: { id: stepId } }),
    )
  })
})
