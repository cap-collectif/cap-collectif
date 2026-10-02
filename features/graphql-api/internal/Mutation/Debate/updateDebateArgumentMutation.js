/* eslint-env jest */
import '../../../_setupDB'

const UpdateDebateArgumentMutation = /* GraphQL */ `
  mutation UpdateDebateArgumentMutation($input: UpdateDebateArgumentInput!) {
    updateDebateArgument(input: $input) {
      errorCode
      debateArgument {
        debate {
          id
        }
        author {
          id
        }
        body
        type
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|UpdateDebateArgument', () => {
  it('try to update argument with wrong argument id', async () => {
    await expect(
      graphql(
        UpdateDebateArgumentMutation,
        {
          input: {
            id: 'wrongId',
            body: "oups je me suis trompé d'id pour l'argument",
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('update argument', async () => {
    await expect(
      graphql(
        UpdateDebateArgumentMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument2'),
            body: "j'ai changé d'avis",
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })
})
