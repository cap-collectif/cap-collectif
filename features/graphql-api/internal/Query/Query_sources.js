/* eslint-env jest */
const SourcesQuery = /* GraphQL */ `
query sources($term: String, $first: Int, $after: String, $orderBy: SourceOrder) {
  sources(term: $term, first: $first, after: $after, orderBy: $orderBy){
    totalCount
    edges {
      node {
        __typename
        body
        related {
          id
          url
        }
        author {
          username
        }
        trashedStatus
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

describe('Internal|Query.sources', () => {
  it('fetches list of sources', async () => {
    await expect(graphql(SourcesQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches list of sources based on author name', async () => {
    await expect(graphql(SourcesQuery, {term: "lbrunet"}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches list of sources based on body', async () => {
    await expect(graphql(SourcesQuery, {term: "blabla"}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('should throw access denied', async () => {
    await expect(
      graphql(SourcesQuery, { }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('fetches the first page of items', async () => {
    const res = await graphql(SourcesQuery, { first: 10, after: null }, 'internal_admin');
    expect(res.sources.edges).toHaveLength(10);
  });

  it('fetches the next 10 items after the first page', async () => {
    let res = await graphql(SourcesQuery, { first: 10, after: null }, 'internal_admin');

    const endCursor = res.sources.pageInfo.endCursor;

    res = await graphql(SourcesQuery, { first: 10, after: endCursor }, 'internal_admin');
    expect(res.sources.edges).toHaveLength(10);
  });

  it('fetches the sources list ordered by latest created', async () => {
    await expect(
      graphql(
        SourcesQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'DESC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the sources list ordered by latest updated', async () => {
    await expect(
      graphql(
        SourcesQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'DESC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the sources list ordered by first created', async () => {
    await expect(
      graphql(
        SourcesQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'ASC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the sources list ordered by first updated', async () => {
    await expect(
      graphql(
        SourcesQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'ASC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches an empty page when offset exceeds total items', async () => {
    let res = await graphql(SourcesQuery, {  }, 'internal_admin');

    const endCursor = res.sources.pageInfo.endCursor;

    res = await graphql(SourcesQuery, { first: 1, after: endCursor }, 'internal_admin');
    expect(res.sources.edges).toHaveLength(0);
  });
});