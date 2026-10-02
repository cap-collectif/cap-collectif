//* eslint-env jest */
const mediasQuery = /* GraphQL */ `
  query mediasQuery($showProfilePictures: Boolean!) {
    medias(showProfilePictures: $showProfilePictures) {
      totalCount
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query medias', () => {
  it('Fetch all medias', async () => {
    await expect(
      graphql(
        mediasQuery,
        {
          showProfilePictures: true,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Fetch medias hiding profile pictures', async () => {
    await expect(
      graphql(
        mediasQuery,
        {
          showProfilePictures: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
