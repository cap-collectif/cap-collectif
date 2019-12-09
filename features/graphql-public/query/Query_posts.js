/* eslint-env jest */
const PostsQuery = /* GraphQL */ `
  query PostsQuery {
    posts {
      id
      title
      frTitle: title(locale: FR_FR)
      enTitle: title(locale: EN_GB)
      translations {
        title
        body
        locale
      }
    }
  }
`;

describe('Internal|Query.posts array', () => {
  it('fetches the posts with their translations', async () => {
    await expect(graphql(PostsQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
