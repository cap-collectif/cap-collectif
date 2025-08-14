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
`;

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
`;

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
`;

const variables = {
  term: null,
  orderBy: { field: 'CREATED_AT', direction: 'DESC' },
  filterStatus: ['PUBLISHED', 'NOT_PUBLISHED', 'DRAFT', 'PENDING'],
};

describe('Internal|Questionnaire.adminReplies', () => {
  it('should fetch all replies given all status filters', async () => {
    await expect(
      graphql(QuestionnaireAdminRepliesQuery, variables, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
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
    ).resolves.toMatchSnapshot();
  });
});
