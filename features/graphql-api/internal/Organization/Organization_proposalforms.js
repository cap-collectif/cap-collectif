/* eslint-env jest */
const OrganizationProposalForms = /* GraphQL */ `
  query OrganizationProposalForms($organizationId: ID!, $availableOnly: Boolean!) {
    node(id: $organizationId) {
      ... on Organization {
        id
        proposalForms(availableOnly: $availableOnly) {
          totalCount
          edges {
            node {
              title
              step {
                title
              }
              creator {
                username
              }
              owner {
                __typename
                username
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Organization.ProposalForms', () => {
  it('organization admin should be able to fetch all proposalForms from organization', async () => {
    await expect(
      graphql(
        OrganizationProposalForms,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          availableOnly: false
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('organization admin should be able to fetch all proposalForms from organization not attached to a step ', async () => {
    await expect(
      graphql(
        OrganizationProposalForms,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          availableOnly: true
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
})