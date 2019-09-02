// @flow
/* eslint-env jest */
const ProjectsPublicQuery = /* GraphQL */ `
  query ProjectsPublicQuery($count: Int!, $cursor: String) {
    projects(first: $count, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          cover {
            url
          }
          contributionsCount
          votes {
            totalCount
          }
          contributors {
            totalCount
          }
        }
      }
    }
  }
`;

const ProjectsInternalQuery = /* GraphQL */ `
  query ProjectsInternalQuery(
    $count: Int!
    $cursor: String
    $orderBy: ProjectOrder
    $term: String
  ) {
    projects(first: $count, after: $cursor, term: $term, orderBy: $orderBy) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          publishedAt
          contributionsCount
        }
      }
    }
  }
`;

const ProjectsThemeQuery = /* GraphQL */ `
  query ProjectsThemeQuery($count: Int!, $cursor: String, $theme: ID) {
    projects(first: $count, after: $cursor, theme: $theme) {
      totalCount
      edges {
        node {
          id
          themes {
            id
          }
        }
      }
    }
  }
`;

const ProjectsTypeQuery = /* GraphQL */ `
  query ProjectsTypeQuery($count: Int!, $cursor: String, $type: ID) {
    projects(first: $count, after: $cursor, type: $type) {
      totalCount
      edges {
        node {
          id
          type {
            id
          }
        }
      }
    }
  }
`;

describe('Preview|Query.projects connection', () => {
  it('fetches the public projects with a cursor', async () => {
    await expect(
      graphql(ProjectsPublicQuery, {
        count: 100,
      }),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the public and private projects with a cursor', async () => {
    await expect(
      graphql(
        ProjectsPublicQuery,
        {
          count: 100,
        },
        'admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the public projects ordered by latest', async () => {
    await expect(
      graphql(
        ProjectsInternalQuery,
        {
          orderBy: { field: 'LATEST', direction: 'ASC' },
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  /*
  it('fetches the public projects ordered by popularity', async () => {
    await expect(
      graphql(
        ProjectsInternalQuery,
        {
          orderBy: { field: 'POPULAR', direction: 'DESC' },
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  */

  it('fetches the public projects with a specific theme', async () => {
    await expect(
      graphql(
        ProjectsThemeQuery,
        {
          theme: 'theme1',
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the public projects with a specific type', async () => {
    await expect(
      graphql(
        ProjectsTypeQuery,
        {
          type: '3',
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the public projects containing a specific term', async () => {
    await expect(
      graphql(
        ProjectsInternalQuery,
        {
          term: 'Croissance',
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
