const QuestionnaireAdminRepliesQuery = /** GraphQL */ `
  query QuestionnaireAdminReplies($term: String, $orderBy: ReplyOrder, $filterStatus: [ReplyStatus]) {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        id
        title
        adminReplies(term: $term, orderBy: $orderBy, filterStatus: $filterStatus) {
          totalCount
          edges {
            node {
              __typename
              id
              updatedAt
              createdAt
              published
              status
              draft
              notPublishedReason
              author {
                username
                email
              }
            }
          }
        }
      }
    }
  }
`

const QuestionnaireAdminStatusRepliesQuery = /** GraphQL */ `
  query QuestionnaireAdminReplies($term: String, $orderBy: ReplyOrder, $filterStatus: [ReplyStatus]) {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        id
        adminReplies(term: $term, orderBy: $orderBy, filterStatus: $filterStatus) {
          totalCount
          edges {
            node {
              __typename
              id
              status
              published
              draft
            }
          }
        }
      }
    }
  }
`

const OrganizationQuestionnaireAdminRepliesQuery = /** GraphQL */ `
  query OrganizationQuestionnaireAdminReplies {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlT3JnYQ==") {
      ... on Questionnaire {
        adminReplies {
          totalCount
        }
      }
    }
  }
`

const ProjectAdminQuestionnaireAdminRepliesQuery = /** GraphQL */ `
  query ProjectAdminQuestionnaireAdminReplies {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlUHJvamVjdE93bmVyQW5vbnltb3Vz") {
      ... on Questionnaire {
        adminReplies {
          totalCount
        }
      }
    }
  }
`

const StandaloneQuestionnaireAdminRepliesQuery = /** GraphQL */ `
  query StandaloneQuestionnaireAdminReplies {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlT3duZXJXaXRob3V0U3RlcA==") {
      ... on Questionnaire {
        adminReplies {
          totalCount
        }
      }
    }
  }
`

const QuestionnaireAdminOrderRepliesQuery = /** GraphQL */ `
  query QuestionnaireAdminReplies($term: String, $orderBy: ReplyOrder, $filterStatus: [ReplyStatus]) {
    node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        id
        adminReplies(term: $term, orderBy: $orderBy, filterStatus: $filterStatus) {
          totalCount
          edges {
            node {
              __typename
              id
              publishedAt
              createdAt
              updatedAt
            }
          }
        }
      }
    }
  }
`

const variables = {
  term: null,
  orderBy: { field: 'CREATED_AT', direction: 'DESC' },
  filterStatus: ['PUBLISHED', 'NOT_PUBLISHED', 'DRAFT', 'PENDING'],
}

describe('Internal|Questionnaire.adminReplies', () => {
  it('denies a non-admin user', async () => {
    await expect(graphql(QuestionnaireAdminRepliesQuery, variables, 'internal_user')).resolves.toMatchObject({
      node: null,
    })
  })

  it('allows an organization member to fetch replies', async () => {
    const response = await graphql(OrganizationQuestionnaireAdminRepliesQuery, undefined, 'internal_valerie')

    expect(response.node?.adminReplies.totalCount).toBeGreaterThan(0)
  })

  it('denies an organization member replies from another organization', async () => {
    await expect(graphql(OrganizationQuestionnaireAdminRepliesQuery, undefined, 'internal_mickael')).resolves.toMatchObject({
      node: null,
    })
  })

  it('allows a project admin to fetch replies from their questionnaire', async () => {
    const response = await graphql(ProjectAdminQuestionnaireAdminRepliesQuery, undefined, 'internal_project_admin')

    expect(response.node?.adminReplies.totalCount).toBeGreaterThan(0)
  })

  it('denies a project admin replies from another organization', async () => {
    await expect(
      graphql(OrganizationQuestionnaireAdminRepliesQuery, undefined, 'internal_project_admin'),
    ).resolves.toMatchObject({ node: null })
  })

  it('uses questionnaire access for a standalone questionnaire', async () => {
    const response = await graphql(StandaloneQuestionnaireAdminRepliesQuery, undefined, 'internal_project_admin')

    expect(response.node?.adminReplies).toBeDefined()
  })

  it('should fetch all replies given all status filters', async () => {
    await expect(graphql(QuestionnaireAdminRepliesQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })
  it('should only fetch published replies', async () => {
    await expect(
      graphql(
        QuestionnaireAdminStatusRepliesQuery,
        {
          ...variables,
          filterStatus: ['PUBLISHED'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should only fetch draft replies', async () => {
    await expect(
      graphql(
        QuestionnaireAdminStatusRepliesQuery,
        {
          ...variables,
          filterStatus: ['DRAFT'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should only fetch unpublished replies', async () => {
    await expect(
      graphql(
        QuestionnaireAdminStatusRepliesQuery,
        {
          ...variables,
          filterStatus: ['NOT_PUBLISHED'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should only fetch pending replies', async () => {
    await expect(
      graphql(
        QuestionnaireAdminStatusRepliesQuery,
        {
          ...variables,
          filterStatus: ['PENDING'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should fetch empty replies when no filters given', async () => {
    await expect(
      graphql(
        QuestionnaireAdminStatusRepliesQuery,
        {
          ...variables,
          filterStatus: [],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should only fetch replies authored by admin', async () => {
    await expect(
      graphql(
        QuestionnaireAdminRepliesQuery,
        {
          ...variables,
          term: 'admin',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should fetch replies ordered by updatedAt ASC', async () => {
    await expect(
      graphql(
        QuestionnaireAdminOrderRepliesQuery,
        {
          ...variables,
          orderBy: { field: 'UPDATED_AT', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
