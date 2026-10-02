/* eslint-env jest */
import '../../_setupDB'

const TrashMutation = /* GraphQL */ `
  mutation TrashMutation($input: TrashInput!) {
    trash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedReason
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Trash', () => {
  it('try to trash non trashable entity', async () => {
    await expect(
      graphql(
        TrashMutation,
        {
          input: {
            id: toGlobalId('Debate', 'debateCannabis'),
            trashedStatus: 'INVISIBLE',
            trashedReason: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('trash argument', async () => {
    await expect(
      graphql(
        TrashMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument5'),
            trashedStatus: 'INVISIBLE',
            trashedReason: 'ON PEUT PLUS DIRE CA',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
