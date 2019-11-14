/* eslint-env jest */
const UserContributionsCountByProjectQuery = /* GraphQL */ `
  query UserContributionsCountByProjectQuery($id: ID!, $project: ID!) {
    node(id: $id) {
      ... on User {
        contributions(project: $project) {
          totalCount
        }
      }
    }
  }
`;

const UserContributionsCountByStepQuery = /* GraphQL */ `
  query UserContributionsCountByStepQuery($id: ID!, $step: ID!) {
    node(id: $id) {
      ... on User {
        contributions(step: $step) {
          totalCount
        }
      }
    }
  }
`;

const UserContributionsCountByConsultationQuery = /* GraphQL */ `
  query UserContributionsCountByConsultationQuery($id: ID!, $consultation: ID!) {
    node(id: $id) {
      ... on User {
        contributions(consultation: $consultation) {
          totalCount
        }
      }
    }
  }
`;

describe('User.contributions connection', () => {
  it("fetches a user's published, non-draft, non-trashed contributions by project", async () => {
    await Promise.all(
      [
        { user: 'user1', project: 'project1' },
        { user: 'user2', project: 'project4' },
        { user: 'user5', project: 'project6' },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsCountByProjectQuery,
            {
              id: toGlobalId('User', item.user),
              project: item.project,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.id);
      }),
    );
  });

  it("fetches a user's published, non-draft, non-trashed contributions by step", async () => {
    await Promise.all(
      [
        { user: 'user1', step: 'cstep1' },
        { user: 'user2', step: 'collectstep5' },
        { user: 'user5', step: 'cstep7' },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsCountByStepQuery,
            {
              id: toGlobalId('User', item.user),
              step: item.step,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.id);
      }),
    );
  });

  it("fetches a user's published, non-draft, non-trashed contributions by consultation", async () => {
    await Promise.all(
      [
        { user: 'user1', consultation: 'PJL' },
        { user: 'user2', consultation: 'default' },
        { user: 'user5', consultation: 'all' },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsCountByConsultationQuery,
            {
              id: toGlobalId('User', item.user),
              consultation: item.consultation,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.id);
      }),
    );
  });
});
