/* eslint-env jest */
const OrganizationQuestionnaires = /* GraphQL */ `
  query OrganizationQuestionnaires($organizationId: ID!, $availableOnly: Boolean!) {
    node(id: $organizationId) {
      ...on Organization {
        questionnaires(availableOnly: $availableOnly) {
          totalCount
          edges {
            node {
              title
              step {
                id
              }
              owner {
                username
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Organization.Questionnaires', () => {
  it('organization admin should be able to fetch all questionnaires from organization', async () => {
    await expect(
      graphql(
        OrganizationQuestionnaires,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          availableOnly: false
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('organization admin should be able to fetch all questionnaires from organization not attached to a step ', async () => {
    await expect(
      graphql(
        OrganizationQuestionnaires,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          availableOnly: true
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
})