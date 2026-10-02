/* eslint-env jest */
import '../../../_setupDB'

const DeleteOpinionMutation = /* GraphQL*/ `
    mutation ($input: DeleteOpinionInput!) {
        deleteOpinion(input: $input) {
            deletedOpinionId
        }
    }
`

describe('mutations.deleteOpinionMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Author wants to delete his opinion', async () => {
    await expect(
      graphql(
        DeleteOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTE=',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('User wants to delete a version but is not the author', async () => {
    await expect(
      graphql(
        DeleteOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMQ==',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('You are not the author of opinion with id: opinion1')
  })
})
