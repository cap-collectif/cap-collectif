/* eslint-env jest */
const ProjectAdminAnalysisTabQuery = /* GraphQL */ `
  query ProjectAdminAnalysisTabQuery(
    $projectId: ID!
    $count: Int!
    $category: ID
    $district: ID
    $supervisor: ID
    $analysts: [ID!]
    $decisionMaker: ID
    $progressStatus: ProposalProgressState!
  ) {
    project: node(id: $projectId) {
      id
      ... on Project {
        firstAnalysisStep {
          proposals(
            first: $count
            category: $category
            district: $district
            supervisor: $supervisor
            analysts: $analysts
            decisionMaker: $decisionMaker
            progressStatus: $progressStatus
          ) {
            edges {
              node {
                id
                progressStatus
                supervisor {
                  id
                }
                analysts {
                  id
                }
                decisionMaker {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Query.ProjectAdminAnalysisTab', () => {
  it('fetches proposals assigned to specific analysts, supervisor, decisionMaker', async () => {
    await expect(
      graphql(
        ProjectAdminAnalysisTabQuery,
        {
          category: null,
          count: 5,
          district: null,
          projectId: toGlobalId('Project', 'projectIdf'),
          analysts: [toGlobalId('User', 'userMaxime'), toGlobalId('User', 'userAgui')],
          supervisor: toGlobalId('User', 'userSpyl'),
          decisionMaker: toGlobalId('User', 'userMaximeQA'),
          progressStatus: 'TODO',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches proposals with progressStatus filter "en cours"', async () => {
    await expect(
      graphql(
        ProjectAdminAnalysisTabQuery,
        {
          category: null,
          count: 5,
          district: null,
          projectId: toGlobalId('Project', 'projectIdf'),
          analysts: null,
          supervisor: null,
          decisionMaker: null,
          progressStatus: 'IN_PROGRESS',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches proposals assigned to specific analysts, supervisor, decisionMaker and with progressStatus filter "en cours"', async () => {
    await expect(
      graphql(
        ProjectAdminAnalysisTabQuery,
        {
          category: null,
          count: 5,
          district: null,
          projectId: toGlobalId('Project', 'projectIdf'),
          analysts: [toGlobalId('User', 'userMaxime'), toGlobalId('User', 'userTheo')],
          supervisor: toGlobalId('User', 'userSpyl'),
          decisionMaker: toGlobalId('User', 'userMaximeQA'),
          progressStatus: 'IN_PROGRESS',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
