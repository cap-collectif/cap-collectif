/* eslint-env jest */
import '../../_setupDB'
import '../../_setupES'
import { restoreProposalTestState } from '../../_proposalAuthorRestrictions'

// Restore this suite's final scenario even when an assertion fails.
afterAll(restoreProposalTestState)

const ReadProposal = /* GraphQL */ `
  query ReadDeletedProposal($id: ID!) {
    node(id: $id) {
      ... on Proposal {
        id
        draft
        title
      }
    }
  }
`

const DeleteProposal = /* GraphQL*/ `
    mutation DeleteProposal($input: DeleteProposalInput!) {
        deleteProposal(input: $input) {
            proposal {
                id
            }
        }
    }
`

/**
 * @jest-status compliant
 * @jest-reason Checks real API deletion and refusals with persisted effects and final backend restoration.
 */
describe('mutations.deleteProposal', () => {
  it('rejects a restricted author deletion without changing the published proposal', async () => {
    await global.runSQL('UPDATE step SET prevent_proposal_delete = 1 WHERE id = "collectstepIdf"')
    const proposalId = toGlobalId('Proposal', 'proposalIdf1')
    const before = await graphql(ReadProposal, { id: proposalId }, 'internal_kiroule')
    expect(before.node.id).toBe(proposalId)

    await expect(
      graphql(
        DeleteProposal,
        {
          input: {
            proposalId,
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't delete proposal")
    const after = await graphql(ReadProposal, { id: proposalId }, 'internal_kiroule')
    expect(after.node).toEqual(before.node)
  })
  it('allows the author to delete a draft with both restrictions enabled', async () => {
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    await global.runSQL('UPDATE proposal SET is_draft = 1 WHERE id = "proposal2"')
    const response = await graphql(
      DeleteProposal,
      { input: { proposalId: toGlobalId('Proposal', 'proposal2') } },
      'internal_user',
    )
    expect(response.deleteProposal.proposal.id).toBe(toGlobalId('Proposal', 'proposal2'))
    const persisted = await global.runSQL(
      'SELECT JSON_OBJECT("deleted", deleted_at IS NOT NULL) AS proposal_state FROM proposal WHERE id = "proposal2"',
    )
    expect(persisted).toMatch(/"deleted":\s*(?:true|1)\b/)
  })

  it('allows a participant to delete a draft but refuses a restricted published proposal', async () => {
    await global.runSQL('UPDATE proposal SET deleted_at = NULL, is_draft = 0 WHERE id = "proposal1"')
    await global.runSQL(
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    const input = { proposalId: toGlobalId('Proposal', 'proposal1'), participantToken: btoa('fakeToken1') }
    const before = await graphql(ReadProposal, { id: input.proposalId }, 'internal')
    expect(before.node.id).toBe(input.proposalId)
    await expect(graphql(DeleteProposal, { input }, 'internal')).rejects.toThrow("Can't delete proposal")
    const after = await graphql(ReadProposal, { id: input.proposalId }, 'internal')
    expect(after.node).toEqual(before.node)
    await global.runSQL('UPDATE proposal SET is_draft = 1 WHERE id = "proposal1"')
    const response = await graphql(DeleteProposal, { input }, 'internal')
    expect(response.deleteProposal.proposal.id).toBe(input.proposalId)
    const persisted = await global.runSQL(
      'SELECT JSON_OBJECT("deleted", deleted_at IS NOT NULL) AS proposal_state FROM proposal WHERE id = "proposal1"',
    )
    expect(persisted).toMatch(/"deleted":\s*(?:true|1)\b/)
  })
})

// TODO migrate tests from deleteProposal.feature to this file
