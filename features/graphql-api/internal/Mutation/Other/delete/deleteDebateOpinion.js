/* eslint-env jest */
import '../../../../_setupDB'

const DeleteDebateOpinionMutation = /* GraphQL */ `
  mutation DeleteDebateOpinionMutation($input: DeleteDebateOpinionInput!) {
    deleteDebateOpinion(input: $input) {
      debate {
        id
      }
      deletedDebateOpinionId
      errorCode
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|DeleteDebateOpinion mutation', () => {
  it('Delete a debate opinion.', async () => {
    const response = await graphql(
      DeleteDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
