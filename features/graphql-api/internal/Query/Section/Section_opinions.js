/* eslint-env jest */

const SectionOpinionsQuery = /* GraphQL */ `
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: { field: POSITIONS, direction: DESC }) {
          totalCount
          edges {
            node {
              id
              pinned
            }
          }
        }
      }
    }
  }
`

const SectionOpinionsByVotesQuery = /* GraphQL */ `
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: { field: VOTES, direction: DESC }) {
          totalCount
          edges {
            node {
              id
              pinned
              votes {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

const SectionOpinionsByFavoritesQuery = /* GraphQL */ `
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: { field: VOTES_OK, direction: DESC }) {
          totalCount
          edges {
            node {
              id
              pinned
              votes(value: YES) {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

const SectionOpinionsByCommentsQuery = /* GraphQL */ `
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: { field: COMMENTS, direction: DESC }) {
          totalCount
          edges {
            node {
              id
              pinned
              arguments {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Section.opinions connection', () => {
  it('lists opinions ordered by positions', async () => {
    await expect(graphql(SectionOpinionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists opinions ordered by votes', async () => {
    await expect(graphql(SectionOpinionsByVotesQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists opinions ordered by favorites', async () => {
    await expect(graphql(SectionOpinionsByFavoritesQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists opinions ordered by comments', async () => {
    await expect(graphql(SectionOpinionsByCommentsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
