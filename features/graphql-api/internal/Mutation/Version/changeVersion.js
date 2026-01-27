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
