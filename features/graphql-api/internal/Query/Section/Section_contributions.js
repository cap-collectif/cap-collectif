/* eslint-env jest */

const SectionContributionsQuery = /* GraphQL */ `
  query {
    section: node(id: "opinionType5") {
      ... on Section {
        contributionConnection(first: 5, orderBy: { field: VOTE_COUNT, direction: DESC }) {
          totalCount
          edges {
            cursor
            node {
              ... on Opinion {
                title
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Section.contributionConnection', () => {
  it('lists contributions ordered by vote count', async () => {
    await expect(graphql(SectionContributionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
