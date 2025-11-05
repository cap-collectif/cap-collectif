/* eslint-env jest */
import '../../../_setup'

const DeleteOfficialResponseMutation = /* GraphQL*/ `
  mutation ($input: DeleteOfficialResponseInput!) {
    deleteOfficialResponse(input: $input) {
      error
      id
    }
  }
`

describe('mutations.deleteOfficialResponse', () => {
  it('GraphQL client wants to delete an officialResponse but wrong id', async () => {
    const response = await graphql(
      DeleteOfficialResponseMutation,
      {
        input: {
          id: 'wrongId',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it('GraphQL client delete an officialResponse', async () => {
    const response = await graphql(
      DeleteOfficialResponseMutation,
      {
        input: {
          id: 'T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMTE=',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
