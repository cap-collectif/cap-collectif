const ProposalRevisionsQuery = /* GraphQL */ `
  query getProposalRevisions($id: ID!, $state: ProposalRevisionState) {
    proposal: node(id: $id) {
      ... on Proposal {
        id
        revisions(first: 100, state: $state) {
          totalCount
          edges {
            node {
              id
              state
              createdAt
            }
          }
        }
      }
    }
  }
`;

describe('Internal.revisions', () => {
  it("fetches proposal's related revisions with state done", async () => {
    await expect(
      graphql(
        ProposalRevisionsQuery,
        {
          id: toGlobalId('Proposal', 'proposalIdf1'),
          state: 'REVISED',
        },
        'internal_welcomatic',
      ),
    ).resolves.toMatchSnapshot();
  });
  it("fetches proposal's related revisions with state pending", async () => {
    await expect(
      graphql(
        ProposalRevisionsQuery,
        {
          id: toGlobalId('Proposal', 'proposalIdf1'),
          state: 'PENDING',
        },
        'internal_welcomatic',
      ),
    ).resolves.toMatchSnapshot();
  });
  it("fetches all proposal's related revisions", async () => {
    await expect(
      graphql(
        ProposalRevisionsQuery,
        {
          id: toGlobalId('Proposal', 'proposalIdf1'),
        },
        'internal_welcomatic',
      ),
    ).resolves.toMatchSnapshot();
  });
  it("fetches all proposal's expired related revisions", async () => {
    await expect(
      graphql(
        ProposalRevisionsQuery,
        {
          id: toGlobalId('Proposal', 'proposalIdf1'),
          state: 'EXPIRED',
        },
        'internal_welcomatic',
      ),
    ).resolves.toMatchSnapshot();
  });
});
