/* eslint-env jest */
import '../../../_setupDB'

const ChangeSiteFaviconMutation = /* GraphQL*/ `
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

const RemoveSiteFaviconMutation = /* GraphQL*/ `
  mutation ($input: RemoveSiteFaviconInput!) {
    removeSiteFavicon(input: $input) {
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

describe('mutations.removeSiteFavicon', () => {
  it('GraphQL admin client wants to remove the current favicon', async () => {
    await graphql(
      ChangeSiteFaviconMutation,
      {
        input: {
          mediaId: 'media12',
        },
      },
      'internal_admin',
    )

    await expect(
      graphql(
        RemoveSiteFaviconMutation,
        {
          input: {},
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      removeSiteFavicon: {
        siteFavicon: {
          id: expect.any(String),
        },
      },
    })
  })

  it('GraphQL client who is not an admin wants to remove the current favicon', async () => {
    await expect(
      graphql(
        RemoveSiteFaviconMutation,
        {
          input: {},
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
