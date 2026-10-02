/* eslint-env jest */
import '../../../../_setupDB'
const faviconQuery = /* GraphQL */ `
  query {
    siteFavicon {
      id
      keyname
      media {
        id
        url
      }
    }
  }
`

const faviconMutation = /* GraphQL */ `
  mutation ($input: ChangeSiteFaviconInput!) {
    changeSiteFavicon(input: $input) {
      siteFavicon {
        id
        keyname
        media {
          id
          url
        }
      }
    }
  }
`

describe('Internal|Favicon', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin client wants to update the current favicon', async () => {
    await expect(graphql(faviconQuery, {}, 'internal_admin')).resolves.toMatchSnapshot({
      siteFavicon: {
        id: expect.any(String),
      },
    })

    await expect(
      graphql(
        faviconMutation,
        {
          input: {
            mediaId: 'media12',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      changeSiteFavicon: {
        siteFavicon: {
          id: expect.any(String),
          media: {
            url: expect.any(String),
          },
        },
      },
    })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('GraphQL client who is not an admin wants to update the current favicon', async () => {
    await expect(graphql(faviconQuery, {}, 'internal_user')).resolves.toMatchSnapshot({
      siteFavicon: {
        id: expect.any(String),
      },
    })

    await expect(
      graphql(
        faviconMutation,
        {
          input: {
            mediaId: 'media12',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
