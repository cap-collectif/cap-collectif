/* eslint-env jest */
import '../../../_setup'

const DeleteDebateAnonymousArgumentMutation = /* GraphQL */ `
  mutation DeleteDebateAnonymousArgumentMutation($input: DeleteDebateAnonymousArgumentInput!) {
    deleteDebateAnonymousArgument(input: $input) {
      errorCode
      deletedDebateAnonymousArgumentId
      debate {
        id
      }
    }
  }
`

describe('Internal|DeleteDebateAnonymousArgument mutation', () => {
  it('should successfully delete an existing anonymous argument when the given hash is valid.', async () => {
    // FOR / jesuisletokendudebateanonymousargumentfor1
    const hash = 'Rk9SOmplc3Vpc2xldG9rZW5kdWRlYmF0ZWFub255bW91c2FyZ3VtZW50Zm9yMQ=='
    const response = await graphql(
      DeleteDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateCannabis'),
          hash,
        },
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
  })
  it('should error when the given hash is valid.', async () => {
    const response = await graphql(
      DeleteDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateCannabis'),
          hash: 'invalid',
        },
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
  })
})
