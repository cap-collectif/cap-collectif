/* eslint-env jest */

// Media is not part of Node interface
const EventMediaQuery = /* GraphQL */ `
  query EventMediaQuery($id: ID!) {
    node(id: $id) {
      ... on Event {
        media {
          url
          urlProject: url(format: "default_project")
          urlAvatar: url(format: "default_avatar")
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Media.url', () => {
  it('it fetches a media url', async () => {
    await Promise.all(
      ['event4'].map(async id => {
        await expect(
          graphql(
            EventMediaQuery,
            {
              id: global.toGlobalId('Event', id),
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })
})
