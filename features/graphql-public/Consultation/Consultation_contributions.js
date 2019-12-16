//* eslint-env jest */
const ConsultationListContribtionsQuery = /* GraphQL */ `
  query ConsultationListContributionsQuery($consultationId: ID!, $orderBy: ContributionOrder!) {
    node(id: $consultationId) {
      ... on Consultation {
        id
        title
        contributions(orderBy: $orderBy) {
          edges {
            node {
              ... on Version {
                id
                title
                createdAt
                updatedAt
              }
              ... on Opinion {
                id
                title
                createdAt
                updatedAt
              }
              ... on Source {
                id
                title
                createdAt
                updatedAt
              }
              ... on Argument {
                id
                body
                createdAt
                publishedAt
              }
            }
          }
        }
      }
    }
  }
`;

describe('Preview|Query consultation contributions', () => {
  it('fetches the contributions of a consultation ordered by publication date DESC', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the contributions of a consultation ordered by publication date ASC', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the contributions of a consultation ordered by creation date DESC', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
          orderBy: { field: 'CREATED_AT', direction: 'DESC' },
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the contributions of a consultation ordered by creation date ASC', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
          orderBy: { field: 'CREATED_AT', direction: 'ASC' },
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });
});
