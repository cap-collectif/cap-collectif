/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    availableConsultations {
      id
    }
  }
`;

describe('Internal|Query.availableConsultations', () => {
  it('fetches consultations without step', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
