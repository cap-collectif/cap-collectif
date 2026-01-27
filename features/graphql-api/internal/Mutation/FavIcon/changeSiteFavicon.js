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

describe('mutations.changeSiteFavicon', () => {
  it('GraphQL admin client wants to edit the current favicon', async () => {
    const response = await graphql(
      ChangeSiteFaviconMutation,
      {
        input: {
          mediaId: 'media12',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot({
      changeSiteFavicon: {
        siteFavicon: {
          media: {
            url: expect.any(String),
          },
        },
      },
    })
  })
})
