//* eslint-env jest */
const ConsultationListContribtionsQuery = /* GraphQL */ `
  query ConsultationListContributionsQuery($consultationId: ID!) {
    node(id: $consultationId) {
      ... on Consultation {
        id
        title
        contributions(orderBy: { field: PUBLISHED_AT, direction: DESC }) {
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
  it('fetches the contributions of a consultation', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOlBKTA==',
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });
});
