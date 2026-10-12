/* eslint-env jest */

const OpenDataRepliesQuery = /* GraphQL */ `
  query OpenDataRepliesQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on Questionnaire {
        replies(first: $count, after: $cursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              createdAt
              publishedAt
              updatedAt
              author {
                id
                userType {
                  name
                }
                responses {
                  edges {
                    node {
                      ... on ValueResponse {
                        value
                      }
                    }
                  }
                }
              }
              responses {
                question {
                  id
                  title
                  __typename
                }
                ... on ValueResponse {
                  value
                }
                ... on MediaResponse {
                  medias {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const AllRepliesQuery = /* GraphQL */ `
  query AllRepliesQuery(
    $id: ID!
    $count: Int!
    $cursor: String
    $includeDraft: Boolean!
    $includeUnpublished: Boolean!
  ) {
    node(id: $id) {
      ... on Questionnaire {
        replies(first: $count, after: $cursor, includeDraft: $includeDraft, includeUnpublished: $includeUnpublished) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              published
              draft
              createdAt
              publishedAt
            }
          }
        }
      }
    }
  }
`

const AllRepliesCountersQuery = /* GraphQL */ `
  query AllRepliesCountersQuery($id: ID!) {
    node(id: $id) {
      ... on Questionnaire {
        allReplies: replies(first: 0, includeDraft: true, includeUnpublished: true) {
          totalCount
        }
        publishedAndDraftReplies: replies(first: 0, includeDraft: true, includeUnpublished: false) {
          totalCount
        }
        publishedAndUnpublishedReplies: replies(first: 0, includeDraft: false, includeUnpublished: true) {
          totalCount
        }
        publishedReplies: replies(first: 0) {
          totalCount
        }
      }
    }
  }
`

const ReplyContributionFieldsQuery = /* GraphQL */ `
  query ReplyContributionFieldsQuery($id: ID!) {
    node(id: $id) {
      ... on Reply {
        related {
          id
        }
        url
        ... on Contribution {
          contributionId: id
          contributionUrl: url
        }
      }
    }
  }
`

const QuestionnaireResponsesQuery = /* GraphQL */ `
  query QuestionnaireResponsesQuery($id: ID!) {
    node(id: $id) {
      ... on SimpleQuestion {
        responses {
          totalCount
          edges {
            node {
              ... on ValueResponse {
                value
              }
            }
          }
        }
      }
    }
  }
`

describe('Preview|Questionnaire.replies connection', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('preserves the public volume without returning replies or cursors', async () => {
    const result = await graphql(OpenDataRepliesQuery, {
      id: toGlobalId('Questionnaire', 'questionnaire1'),
      count: 100,
    })
    expect(result.node.replies.totalCount).toBeGreaterThan(0)
    expect(result.node.replies.edges).toEqual([])
    expect(result.node.replies.pageInfo).toEqual({ hasNextPage: false, endCursor: null })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches the first hundred replies including draft and unpublished with a cursor as an admin', async () => {
    await expect(
      graphql(
        AllRepliesQuery,
        {
          id: toGlobalId('Questionnaire', 'questionnaire1'),
          count: 100,
          includeDraft: true,
          includeUnpublished: true,
        },
        'admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches all replies counters as an admin', async () => {
    await expect(
      graphql(
        AllRepliesCountersQuery,
        {
          id: toGlobalId('Questionnaire', 'questionnaire1'),
        },
        'admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches published counters only as anonymous', async () => {
    await expect(
      graphql(
        AllRepliesCountersQuery,
        {
          id: toGlobalId('Questionnaire', 'questionnaire1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only presence or a positive count instead of the expected API data or authorization
   * contract.
   */
  it('returns only the participation volume to an anonymous user', async () => {
    const result = await graphql(AllRepliesQuery, {
      id: toGlobalId('Questionnaire', 'questionnaireAnonymous'),
      count: 1,
      includeDraft: false,
      includeUnpublished: false,
    })

    expect(result.node.replies.totalCount).toBeGreaterThan(0)
    expect(result.node.replies.edges).toEqual([])
    expect(result.node.replies.pageInfo).toEqual({ hasNextPage: false, endCursor: null })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only presence or a positive count instead of the expected API data or authorization
   * contract.
   */
  it('hides response values and per-question counts from anonymous users', async () => {
    const result = await graphql(QuestionnaireResponsesQuery, {
      id: toGlobalId('Question', 1403),
    })

    expect(result.node.responses).toEqual({ totalCount: 0, edges: [] })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('hides direct reply contributions in the preview schema', async () => {
    await expect(
      graphql(
        ReplyContributionFieldsQuery,
        {
          id: toGlobalId('Reply', 'replyAnonymous2'),
        },
        'preview',
      ),
    ).resolves.toEqual({ node: null })
  })
})
