/* eslint-env jest */
import '../../../_setup'

const AddVersionMutation = /* GraphQL*/ `
    mutation ($input: AddVersionInput!) {
        addVersion(input: $input) {
            version {
                id
                published
                author {
                    _id
                }
            }
            versionEdge {
                cursor
                node {
                    id
                }
            }
            userErrors {
                message
            }
        }
    }
`

describe('mutations.addVersionMutation', () => {
  it('User wants to add a version on an opinion', async () => {
    await expect(
      graphql(
        AddVersionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
            title: 'Nouveau titre',
            body: 'Mes modifications blablabla',
            comment: 'Un peu de fun dans ce monde trop sobre !',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addVersion: {
        version: {
          id: expect.any(String),
        },
        versionEdge: {
          cursor: expect.any(String),
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to add an argument on an uncontibuable opinion', async () => {
    await expect(
      graphql(
        AddVersionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTY=',
            title: 'Nouveau titre',
            body: 'Mes modifications blablabla',
            comment: 'Un peu de fun dans ce monde trop sobre !',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
