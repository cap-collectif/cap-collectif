/* eslint-env jest */
import '../../../_setupDB'

const ChangeSourceMutation = /* GraphQL*/ `
  mutation ($input: ChangeSourceInput!) {
    changeSource(input: $input) {
      source {
        id
        body
        updatedAt
      }
    }
  }
`

describe('mutations.changeSource', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Author wants to update his source', async () => {
    await expect(
      graphql(
        ChangeSourceMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
            body: 'New Tololo',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      changeSource: {
        source: {
          updatedAt: expect.any(String),
        },
      },
    })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('User wants to update a source but is not the author', async () => {
    await expect(
      graphql(
        ChangeSourceMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
            body: 'New Tololo',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't update the source of someone else.")
  })
})
