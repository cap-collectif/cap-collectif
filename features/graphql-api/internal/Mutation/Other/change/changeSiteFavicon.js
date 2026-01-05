
/* eslint-env jest */
import '../../../../_setup'
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
