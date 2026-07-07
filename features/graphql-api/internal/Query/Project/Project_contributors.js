/* eslint-dev jest*/
import '../../../_setupES'

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
        contributors(userType: $userTypeId, step: $stepId, vip: $isVip, first: 5, orderBy: $orderBy, term: $term) {
          totalCount
          edges {
            node {
              __typename
              id
              ... on User {
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
`

const ProjectContributorsTotalCountQuery = /* GraphQL */ `
  query ProjectContributors(
    $projectId: ID!
    $stepId: ID
  ) {
    project: node(id: $projectId) {
      id
      ... on Project {
        contributors(
          step: $stepId
        ) {
          totalCount
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
              ... on Contributor {
                __typename
                consentInternalCommunication
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal.projects.contributors', () => {
  it('fetches contributors filtered by project, step, user type, vip', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
          "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          "contribuableId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          isVip: true,
          userTypeId: 'VXNlclR5cGU6MQ==', // UserType:1
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches contributors filtered by project, step', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
          "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          "contribuableId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches contributors sorted by their activities desc', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
          "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          orderBy: { field: 'ACTIVITY', direction: 'DESC' },
          "contribuableId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches contributors sorted by their activities asc', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          orderBy: { field: 'ACTIVITY', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches contributors that match term parameter', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
        "contribuableId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
        "term": 'sf',
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
    expect(response.project.contributors.edges[0].node.id).toBe('VXNlcjp1c2VyMg==')
  })

  it('fetches contributors that match term, step, userType, vip', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
        "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        "contribuableId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        "isVip": true,
        "userTypeId": 1,
        "term": 'msantos',
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
    expect(response.project.contributors.edges[0].node.id).toBe('VXNlcjp1c2VyV2VsY29tYXR0aWM=')
  })

  it('fetches participant contributors that added a published completed proposal', async () => {
    await runSql('INSERT INTO participant (id, token, firstname, lastname, email, consent_sms_communication, consent_internal_communication, consent_privacy_policy, phone_confirmed, created_at) VALUES ("participantProposalSearch", "participantProposalToken", "Proposal", "Participant", "proposal-participant@test.com", "0", "1", "0", "1", "2020-01-14 00:00:00")')
    await runSql('UPDATE proposal SET participant_id = "participantProposalSearch", completion_status = "COMPLETED", published = 1, is_draft = 0, deleted_at = NULL WHERE id = "proposal10"')

    try {
      const response = await graphql(
        ProjectContributorsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          contribuableId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
          term: 'proposal-participant@test.com',
        },
        'internal_admin',
      )

      expect(response).toMatchSnapshot()
      expect(response.project.contributors.edges[0].node.__typename).toBe('Participant')
      expect(response.project.contributors.edges[0].node.id).toBe('UGFydGljaXBhbnQ6cGFydGljaXBhbnRQcm9wb3NhbFNlYXJjaA==')
    } finally {
      await runSql('UPDATE proposal SET participant_id = NULL WHERE id = "proposal10"')
      await runSql('DELETE FROM participant WHERE id = "participantProposalSearch"')
    }
  })

  it('fetches contributors on debate project', async () => {
    await expect(
      graphql(
        ProjectContributorsQuery,
        {
          "projectId": 'UHJvamVjdDpwcm9qZWN0Q2FubmFiaXM=', // Project:projectCannabis
          "first": 5,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('cannot fetch contributors that match email if user not admin', async () => {
    const response = await graphql(
      ProjectContributorsQuery,
      {
        "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==', // Project:project6
        "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        "contribuableId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // CollectStep:collectstep1
        "term": 'jolicode',
      },
      'internal_user',
    )
    expect(response.project.contributors.totalCount).toBe(0)
  })

  it('project owner checks the internal communication consent of contributors', async () => {
    await expect(
      graphql(
        ProjectContributorsConsentQuery,
        {
          "projectId": 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy', // Project:projectWithOwner
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('get contributors total count with participant meeting requirement', async () => {
    await runSql('INSERT INTO requirement (id, step_id, type, position) VALUES ("requirementTest", "collectstep1", "PHONE_VERIFIED", "1")')
    await runSql('INSERT INTO participant (id, token, consent_sms_communication, consent_internal_communication, consent_privacy_policy, phone_confirmed, created_at) VALUES ("participantTest", "fakeToken1", "0", "1", "0", "1", "2020-01-14 00:00:00")')
    await runSql('UPDATE proposal SET participant_id = "participantTest" WHERE id = "proposal10"')
    const response = await graphql(
      ProjectContributorsTotalCountQuery,
      {
        "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==',
        "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
    await runSql('DELETE FROM requirement WHERE id = "requirementTest"')
    await runSql('UPDATE proposal SET participant_id = NULL WHERE id = "proposal10"')
    await runSql('DELETE FROM participant WHERE id = "participantTest"')
  });
  it('get contributors total count without participant meeting requirement', async () => {
    await runSql('INSERT INTO requirement (id, step_id, type, position) VALUES ("requirementTest", "collectstep1", "PHONE_VERIFIED", "1")')
    const response = await graphql(
      ProjectContributorsTotalCountQuery,
      {
        "projectId": 'UHJvamVjdDpwcm9qZWN0Ng==',
        "stepId": 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
    await runSql('DELETE FROM requirement WHERE id = "requirementTest"')
  });
});
