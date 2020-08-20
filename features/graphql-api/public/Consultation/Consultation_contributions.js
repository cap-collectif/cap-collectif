/* eslint-env jest */
const ConsultationListContribtionsQuery = /* GraphQL */ `
  query ConsultationListContributionsQuery($consultationId: ID!, $orderBy: ContributionOrder!) {
    node(id: $consultationId) {
      ... on Consultation {
        id
        title
        contributions(orderBy: $orderBy) {
          totalCount
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

const InternalQuery = /* GraphQL */ `
  query InternalQuery(
    $consultationId: ID!
    $orderBy: ContributionOrder!
    $includeTrashed: Boolean!
  ) {
    node(id: $consultationId) {
      ... on Consultation {
        id
        title
        contributions(orderBy: $orderBy, includeTrashed: $includeTrashed) {
          totalCount
          edges {
            node {
              ... on Trashable {
                trashed
              }
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

describe('Preview|Consultation.contributions connection', () => {
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

  it('fetches the contributions of a consultation including trashed', async () => {
    await expect(
      graphql(
        InternalQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
          orderBy: { field: 'CREATED_AT', direction: 'ASC' },
          includeTrashed: true,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
