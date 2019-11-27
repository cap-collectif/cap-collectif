/* eslint-env jest */
const PagesQuery = /* GraphQL */ `
  query PagesQuery {
    pages {
      id
      title
      frTitle: title(locale: "fr-FR")
      enTitle: title(locale: "en-GB")
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
