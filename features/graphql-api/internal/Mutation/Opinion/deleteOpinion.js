/* eslint-env jest */
import '../../../_setupDB'

const DeleteOpinionMutation = /* GraphQL*/ `
    mutation ($input: DeleteOpinionInput!) {
        deleteOpinion(input: $input) {
            deletedOpinionId
        }
    }
`

describe('mutations.deleteOpinionMutation', () => {
  it('Author wants to delete his opinion', async () => {
    await expect(
      graphql(
        DeleteOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTE=',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to delete a version but is not the author', async () => {
    await expect(
      graphql(
        DeleteOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMQ==',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('You are not the author of opinion with id: opinion1')
  })
})
