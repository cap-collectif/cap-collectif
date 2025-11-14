//* eslint-env jest */
const QuestionnaireStepContributorsQuery = /* GraphQL */ `
  query QuestionnaireStepContributorsQuery($id: ID!) {
    node(id: $id) {
      ... on QuestionnaireStep {
        id
        title
        contributors(first: 5) {
          totalCount
          edges {
            node {
              id
              username
            }
          }
        }
      }
    }
  }
`

describe('Preview|QuestionnaireStep.contributors connection', () => {
  it('fetches the contributors of a questionnaire step', async () => {
    await expect(
      graphql(
        QuestionnaireStepContributorsQuery,
        {
          id: 'questionnairestep1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
