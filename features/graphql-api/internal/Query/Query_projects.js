//* eslint-env jest */
const ProjectQuery = /* GraphQL */ `
  query ProjectQuery($count: Int, $cursor: String, $archived: ProjectArchiveFilter, $status: ID) {
    projects(first: $count, after: $cursor, archived: $archived, status: $status) {
      totalCount
      edges {
        node {
          id
          title
          archived
          status
          __typename
        }
        cursor
      }
    }
  }
`

const variables = {
  count: 16,
  cursor: null,
  archived: null,
  status: null,
}

const ProjectSearchQuery = /* GraphQL */ `
  query ProjectQuery($term: String) {
    projects(term: $term) {
      edges {
        node {
          title
        }
      }
    }
  }
`

const variablesSearchByProjectTitle = {
  term: 'proposition',
}

const ProjectSearchByCreatorUsernameQuery = /* GraphQL */ `
  query ProjectQuery($term: String) {
    viewer {
      projects(query: $term, searchFields: [CREATOR]) {
        edges {
          node {
            title
            creator {
              username
            }
          }
        }
      }
    }
  }
`

const variablesByProjectCreatorUsername = {
  term: 'welcomattic',
}

const ProjectSearchByOwnerUsernameQuery = /* GraphQL */ `
  query ProjectQuery($term: String) {
    viewer {
      projects(query: $term, searchFields: [OWNER]) {
        edges {
          node {
            title
            owner {
              username
            }
          }
        }
      }
    }
  }
`

const variablesByProjectOwnerUsername = {
  term: 'GIEC',
}

describe('Internal|Query projects', () => {
  it('fetches all projects', async () => {
    await expect(graphql(ProjectQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetches archived projects', async () => {
    await expect(
      graphql(
        ProjectQuery,
        {
          ...variables,
          archived: 'ARCHIVED',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches non archived projects', async () => {
    await expect(
      graphql(
        ProjectQuery,
        {
          ...variables,
          archived: 'ACTIVE',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches opened projects', async () => {
    await expect(
      graphql(
        ProjectQuery,
        {
          ...variables,
          status: 1,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches opened participation projects', async () => {
    await expect(
      graphql(
        ProjectQuery,
        {
          ...variables,
          status: 2,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches closed projects', async () => {
    await expect(
      graphql(
        ProjectQuery,
        {
          ...variables,
          status: 3,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('search by project title', async () => {
    await expect(
      graphql(
        ProjectSearchQuery,
        {
          ...variablesSearchByProjectTitle,
          status: 3,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('search by project creator username', async () => {
    await expect(
      graphql(
        ProjectSearchByCreatorUsernameQuery,
        {
          ...variablesByProjectCreatorUsername,
          status: 3,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('search by project owner username', async () => {
    await expect(
      graphql(
        ProjectSearchByOwnerUsernameQuery,
        {
          ...variablesByProjectOwnerUsername,
          status: 3,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('search by project organization creator username', async () => {
    await expect(
      graphql(
        ProjectSearchByCreatorUsernameQuery,
        {
          ...variablesByProjectCreatorUsername,
          status: 3,
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('search by project organization owner username', async () => {
    await expect(
      graphql(
        ProjectSearchByOwnerUsernameQuery,
        {
          ...variablesByProjectOwnerUsername,
          status: 3,
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
})
