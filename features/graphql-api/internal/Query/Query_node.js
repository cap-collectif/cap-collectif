/* eslint-env jest */

const NodeQuery = /* GraphQL */ `
  query NodeQuery(
    $opinionId: ID!
    $proposalId: ID!
    $projectId: ID!
    $groupId: ID!
    $proposalFormId: ID!
    $questionnaireId: ID!
    $eventId: ID!
    $requirementId: ID!
    $questionId: ID!
    $responseId: ID!
    $districtId: ID!
    $organizationId: ID!
  ) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        title
      }
    }
    proposal: node(id: $proposalId) {
      ... on Proposal {
        title
      }
    }
    project: node(id: $projectId) {
      ... on Project {
        title
      }
    }
    group: node(id: $groupId) {
      ... on Group {
        title
      }
    }
    form: node(id: $proposalFormId) {
      ... on ProposalForm {
        title
      }
    }
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        title
      }
    }
    event: node(id: $eventId) {
      ... on Event {
        title
      }
    }
    requirement: node(id: $requirementId) {
      ... on Requirement {
        id
      }
    }
    question: node(id: $questionId) {
      ... on Question {
        id
      }
    }
    response: node(id: $responseId) {
      ... on ValueResponse {
        id
        __typename
      }
    }
    district: node(id: $districtId) {
      ... on District {
        id
        __typename
      }
    }
    organization: node(id: $organizationId) {
      ... on Organization {
        id
        __typename
      }
    }
  }
`

const NodeQueryVariables = {
  opinionId: 'opinion1',
  proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
  projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
  groupId: 'R3JvdXA6Z3JvdXAx',
  proposalFormId: 'proposalForm1',
  questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
  eventId: 'RXZlbnQ6ZXZlbnQx',
  requirementId: 'UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQx',
  questionId: 'UXVlc3Rpb246Mg==',
  responseId: 'VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjk=',
  districtId: 'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx',
  organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=',
}

const RestrictedProjectQuery = /* GraphQL */ `
  query RestrictedProjectQuery($proposalId: ID!, $projectId: ID!) {
    proposal: node(id: $proposalId) {
      ... on Proposal {
        title
      }
    }
    project: node(id: $projectId) {
      ... on Project {
        title
      }
    }
  }
`

const RestrictedProjectVariables = {
  proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwzNA==',
  projectId: 'UHJvamVjdDpQcm9qZWN0QWNjZXNzaWJsZUZvck1lT25seUJ5QWRtaW4=',
}

describe('Internal|Query.node', () => {
  it('resolves nodes for all supported types', async () => {
    await expect(graphql(NodeQuery, NodeQueryVariables, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns restricted nodes to an admin', async () => {
    await expect(
      graphql(RestrictedProjectQuery, RestrictedProjectVariables, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('hides restricted nodes from an anonymous user', async () => {
    await expect(
      graphql(RestrictedProjectQuery, RestrictedProjectVariables, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('hides restricted nodes from an unauthorized user', async () => {
    await expect(
      graphql(RestrictedProjectQuery, RestrictedProjectVariables, 'internal_pierre'),
    ).resolves.toMatchSnapshot()
  })

  it('returns restricted nodes to a super admin', async () => {
    await expect(
      graphql(RestrictedProjectQuery, RestrictedProjectVariables, 'internal_sfavot'),
    ).resolves.toMatchSnapshot()
  })
})
