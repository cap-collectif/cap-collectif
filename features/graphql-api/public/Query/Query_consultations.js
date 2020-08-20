/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    consultations {
      id
      title
      contribuable
      sections {
        title
      }
    }
  }
`;

describe('Internal|Query.consultations', () => {
  it('fetches all consultations', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
