/* eslint-env jest */
import '../../../../_setupDB'

const UpdateDebateOpinionMutation = /* GraphQL */ `
  mutation UpdateDebateOpinionMutation($input: UpdateDebateOpinionInput!) {
    updateDebateOpinion(input: $input) {
      errorCode
      debateOpinion {
        id
        debate {
          id
        }
        title
        body
        type
        author {
          id
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|UpdateDebateOpinion mutation', () => {
  it('Update a debate opinion.', async () => {
    const response = await graphql(
      UpdateDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
          title: 'Questionnaire non rattaché',
          body: 'Questionnaire non rattaché',
          type: 'FOR',
          author: toGlobalId('User', 'user5'),
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot()
  })

  it('Update partially a debate opinion.', async () => {
    const response = await graphql(
      UpdateDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
          type: 'AGAINST',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot()
  })
})
