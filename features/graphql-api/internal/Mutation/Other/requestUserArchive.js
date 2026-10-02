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

/**
 * @jest-status non-compliant
 * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
 * the database helper runs only before each test.
 */
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
