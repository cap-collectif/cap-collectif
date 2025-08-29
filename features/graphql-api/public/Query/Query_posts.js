/* eslint-env jest */

const query = /* GraphQL */ `
  query PostsQuery($orderBy: PostOrder, $theme: ID, $project: ID, $first: Int, $after: String) {
    posts(orderBy: $orderBy, theme: $theme, project: $project, first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          title
          publishedAt
          themes {
            id
            title
          }
          projects {
            id
            title
          }
          frTitle: title(locale: FR_FR)
          enTitle: title(locale: EN_GB)
          translations {
            title
            body
            abstract
            locale
          }
        }
      }
    }
  }
`;

describe('Internal|Query.posts array', () => {
  it('fetches the posts with their translations', async () => {
    await expect(graphql(query, null, 'internal')).resolves.toMatchSnapshot();
  });

  it('fetches the posts filtered by theme with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          theme: 'theme1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the posts filtered by project with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          project: global.toGlobalId('project', 'project1'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the posts filtered by theme and project with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          theme: 'theme1',
          project: global.toGlobalId('project', 'ProjectAccessibleForMeOnlyByAdmin'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the posts ordered by published date ascending with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the posts ordered by published date descending with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the first 2 posts with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          first: 2,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the first 3 posts after one specific post with their translations', async () => {
    await expect(
      graphql(
        query,
        {
          first: 3,
          after: 'YXJyYXljb25uZWN0aW9uOjA='
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
