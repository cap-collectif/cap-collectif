/* eslint-env jest */
import '../../../_setupDB'

const ChangeSourceMutation = /* GraphQL*/ `
  mutation ($input: ChangeSourceInput!) {
    changeSource(input: $input) {
      source {
        id
        body
        updatedAt
      }
    }
  }
`

describe('mutations.changeSource', () => {
  it('Author wants to update his source', async () => {
    await expect(
      graphql(
        ChangeSourceMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
            body: 'New Tololo',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      changeSource: {
        source: {
          updatedAt: expect.any(String),
        },
      },
    })
  })

  it('User wants to update a source but is not the author', async () => {
    await expect(
      graphql(
        ChangeSourceMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTE=',
            body: 'New Tololo',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't update the source of someone else.")
  })
})
