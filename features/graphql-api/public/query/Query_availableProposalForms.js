/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    availableProposalForms {
      id
    }
  }
`;

describe('Internal|Query.availableProposalForms', () => {
  it('fetches all available proposalForms', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
