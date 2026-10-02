/* eslint-env jest */
import '../../../_setupDB'

const ChangeVersionMutation = /* GraphQL*/ `
    mutation ($input: ChangeVersionInput!) {
        changeVersion(input: $input) {
            version {
                id
                body
                updatedAt
            }
        }
    }
`

describe('mutations.changeVersionMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Author wants to update his version', async () => {
    await expect(
      graphql(
        ChangeVersionMutation,
        {
          input: {
            versionId: 'VmVyc2lvbjp2ZXJzaW9uMQ==',
            body: 'New Tololo',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      changeVersion: {
        version: {
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
  it('User wants to update a version but is not the author', async () => {
    await expect(
      graphql(
        ChangeVersionMutation,
        {
          input: {
            versionId: 'VmVyc2lvbjp2ZXJzaW9uMQ==',
            body: 'New Tololo',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't update the version of someone else.")
  })
})
