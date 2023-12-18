/* eslint-dev jest*/
const ProjectContributorsQuery = /* GraphQL */ `
  query ProjectContributors(
    $projectId: ID!
    $userTypeId: ID
    $contribuableId: ID
    $stepId: ID
    $isVip: Boolean
    $orderBy: UserOrder
    $term: String
  ) {
    project: node(id: $projectId) {
      id
      ... on Project {
        contributors(
          userType: $userTypeId
          step: $stepId
          vip: $isVip
          first: 5
          orderBy: $orderBy
          term: $term
        ) {
          totalCount
          edges {
            node {
              id
              ...on User {
                  userType {
                      id
                  }
                  vip
                  contributions(contribuableId: $contribuableId, includeTrashed: true) {
                      totalCount
                  }
                  votes(contribuableId: $contribuableId) {
                      totalCount
                  }
              }
            }
          }
        }
      }
    }
  }
`;

const ProjectContributorsConsentQuery = /* GraphQL */ `
  query ProjectContributors($projectId: ID!) {
    project: node(id: $projectId) {
      ... on Project {
        contributors {
          edges {
            node {
              ...on User {
                  consentInternalCommunication
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal.projects.contributors', () => {
  it('fetches contributors filtered by project, step, user type, vip', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          isVip: true,
          userTypeId: 1,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches contributors filtered by project, step', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches contributors sorted by their activities desc', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          orderBy: { field: 'ACTIVITY', direction: 'DESC' },
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches contributors sorted by their activities asc', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          orderBy: { field: 'ACTIVITY', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches contributors that match term parameter', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
        contribuableId: 'UHJvamVjdDpwcm9qZWN0Ng==',
        term: 'sf',
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
    expect(response.project.contributors.edges[0].node.id).toBe('VXNlcjp1c2VyMg==');
  });

  it('fetches contributors that match term, step, userType, vip', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
        stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        isVip: true,
        userTypeId: 1,
        term: 'msantos',
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
    expect(response.project.contributors.edges[0].node.id).toBe('VXNlcjp1c2VyV2VsY29tYXR0aWM=');
  });

  it('fetches contributors on debate project', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: toGlobalId('Project', 'projectCannabis'),
          first: 5,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('cannot fetch contributors that match email if user not admin', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
        stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        term: 'jolicode',
      },
      'internal_user',
    );
    expect(response.project.contributors.totalCount).toBe(0);
  });

  it('project owner checks the internal communication consent of contributors', async () => {
    await expect(
      graphql(
        ProjectContributorsConsentQuery,
        {
          projectId: toGlobalId('Project', 'projectWithOwner'),
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot();
  });
});
