/* eslint-env jest */
const CommentsQuery = /* GraphQL */ `
  query comments($term: String, $first: Int, $after: String, $orderBy: CommentOrder) {
    comments(term: $term, first: $first, after: $after, orderBy: $orderBy) {
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
          createdAt
          updatedAt
          trashedStatus
          moderationStatus
          publicationStatus
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

describe('Internal|Query.comments', () => {
  // these tests only Query Data so we can safely enable the multilangue toggle once before all
  beforeAll(async () => {
    await global.enableFeatureFlag('multilangue');
  });

  it('fetches list of comments', async () => {
    await expect(graphql(CommentsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches list of comments based on author name', async () => {
    await expect(graphql(CommentsQuery, {term: "lbrunet"}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches list of comments based on body', async () => {
    await expect(graphql(CommentsQuery, {term: "comment"}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('should throw access denied', async () => {
    await expect(
      graphql(CommentsQuery, { }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('fetches the first page of items', async () => {
    const res = await graphql(CommentsQuery, { first: 10, after: null }, 'internal_admin');
    expect(res.comments.edges).toHaveLength(10);
  });

  it('fetches the next 10 items after the first page', async () => {
    let res = await graphql(CommentsQuery, { first: 10, after: null }, 'internal_admin');

    const endCursor = res.comments.pageInfo.endCursor;

    res = await graphql(CommentsQuery, { first: 10, after: endCursor }, 'internal_admin');
    expect(res.comments.edges).toHaveLength(10);
  });

  it('fetches the comments list ordered by latest created', async () => {
    await expect(
      graphql(
        CommentsQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'DESC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the comments list ordered by latest updated', async () => {
    await expect(
      graphql(
        CommentsQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'DESC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the comments list ordered by first created', async () => {
    await expect(
      graphql(
        CommentsQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'ASC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the comments list ordered by first updated', async () => {
    await expect(
      graphql(
        CommentsQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'ASC' }
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches an empty page when offset exceeds total items', async () => {
    let res = await graphql(CommentsQuery, { first: 1, after: 'YXJyYXljb25uZWN0aW9uOjI1Mw==' /* arrayconnection:253 */ }, 'internal_admin');
    expect(res.comments.edges).toHaveLength(0);
  });
});
