/* eslint-env jest */
import '../../../resetDatabaseBeforeEach'

const DeleteVersionMutation = /* GraphQL*/ `
    mutation ($input: DeleteVersionInput!) {
      deleteVersion(input: $input) {
          deletedVersionId
          opinion {
              id
          }
      }
    }
`

describe('mutations.deleteVersionMutation', () => {
  it('Author wants to delete his version', async () => {
    await expect(
      graphql(
        DeleteVersionMutation,
        {
          input: {
            versionId: 'VmVyc2lvbjp2ZXJzaW9uMQ==',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to delete a version but is not the author', async () => {
    await expect(
      graphql(
        DeleteVersionMutation,
        {
          input: {
            versionId: 'VmVyc2lvbjp2ZXJzaW9uMQ==',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('You are not the author of version with id: version1')
  })
})
