/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation RequestUserArchive($input: RequestUserArchiveInput!) {
    requestUserArchive(input: $input) {
      viewer {
        id
        isArchiveDeleted
        isArchiveReady
        firstArchive
      }
    }
  }
`

describe('Internal|requestUserArchive mutation', () => {
  it('creates a pending archive request for the authenticated user', async () => {
    await expect(graphql(mutation, { input: {} }, 'internal_admin')).resolves.toEqual({
      requestUserArchive: {
        viewer: {
          id: toGlobalId('User', 'userAdmin'),
          isArchiveDeleted: false,
          isArchiveReady: false,
          firstArchive: false,
        },
      },
    })
  })
})
