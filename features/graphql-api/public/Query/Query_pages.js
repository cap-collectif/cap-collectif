/* eslint-env jest */
const PagesQuery = /* GraphQL */ `
  query PagesQuery {
    pages {
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

describe('Internal|Query.pages array', () => {
  it('fetches the first hundred pages with a cursor', async () => {
    await expect(graphql(PagesQuery, { count: 100 }, 'internal')).resolves.toMatchSnapshot();
  });
});
