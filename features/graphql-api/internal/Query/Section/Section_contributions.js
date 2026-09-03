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

const OpinionContributionsQuery = /* GraphQL */ `
  query OpinionContributionsQuery($sectionId: ID!, $first: Int, $orderBy: ContributionOrder) {
    section: node(id: $sectionId) {
      ... on Section {
        contributionConnection(first: $first, orderBy: $orderBy) {
          totalCount
          edges {
            node {
              ... on Opinion {
                id
                publishedAt
                pinned
                title
                position
                arguments {
                  totalCount
                }
                votes {
                  totalCount
                }
                author {
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

describe('Internal|Section.contributionConnection', () => {
  it('lists contributions ordered by vote count', async () => {
    await expect(graphql(SectionContributionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists contributions ordered by votes with a pinned contribution first', async () => {
    await expect(
      graphql(
        OpinionContributionsQuery,
        {
          sectionId: 'opinionType6',
          first: 3,
          orderBy: { field: 'VOTE_COUNT', direction: 'DESC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists contributions ordered by votes', async () => {
    await expect(
      graphql(
        OpinionContributionsQuery,
        {
          sectionId: 'opinionType5',
          first: 3,
          orderBy: { field: 'VOTE_COUNT', direction: 'DESC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists contributions ordered by position', async () => {
    await expect(
      graphql(
        OpinionContributionsQuery,
        {
          sectionId: 'opinionType5',
          orderBy: { field: 'POSITION', direction: 'DESC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
