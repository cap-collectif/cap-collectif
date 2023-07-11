/* eslint-env jest */
const ProposalStepProposalsQuery = /* GraphQL */ `
  query ProposalStepProposalsQuery(
    $id: ID!
    $count: Int!
    $status: ID
    $district: ID
    $category: ID
    $cursor: String
    $orderBy: [ProposalOrder]
  ) {
    node(id: $id) {
      ... on ProposalStep {
        canDisplayBallot
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          status: $status
          district: $district
          category: $category
        ) {
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
              publishedAt
              createdAt
              comments {
                totalCount
              }
              district {
                id
                name(locale: FR_FR)
              }
              category {
                id
                name
              }
              status(step: $id) {
                id
                name
              }
              votes {
                totalCount
                totalPointsCount
              }
              voteOnStep: votes(stepId: $id) {
                totalCount
                totalPointsCount
              }
            }
          }
        }
      }
    }
  }
`;

const ProposalStepProposalsCommentableQuery = /* GraphQL */ `
  query ProposalStepProposalsQuery($id: ID!, $count: Int!, $after: String) {
    node(id: $id) {
      ... on ProposalStep {
        canDisplayBallot
        proposals {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              comments(first: $count, after: $after) {
                pageInfo {
                  startCursor
                  hasNextPage
                  endCursor
                }
                totalCount
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|ProposalStep.proposals connection', () => {
  it('fetches published proposals associated to a collect step with a cursor ordered by comments count DESC', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{field: 'COMMENTS', direction: 'DESC'}],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a collect step with a cursor ordered by comments count ASC', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: [{field: 'COMMENTS', direction: 'ASC'}],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a collect step with a cursor ordered by old published', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'ASC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 2,
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches proposals with most points associated to a collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 2,
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: [{ field: 'POINTS', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches proposals with most votes associated to a collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 2,
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: [{ field: 'VOTES', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a collect step and a status "En cours" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          status: 'status1',
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a question collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          id: toGlobalId('CollectStep', 'collectQuestionVoteAvecClassement'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a status "Soumis au vote" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          status: 'status4',
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a district "Beauregard" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          district: toGlobalId('District', 'district1'),
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a category "Aménagement" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        {
          count: 100,
          category: 'pCategory1',
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: [{ field: 'PUBLISHED_AT', direction: 'DESC' }],
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep with paginated commentables after cursor with exact count', async () => {
    await expect(
      graphql(
        ProposalStepProposalsCommentableQuery,
        {
          count: 3,
          after: 'Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx',
          id: toGlobalId('SelectionStep', 'selectionstep1'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it(
    'fetches published proposals associated to a SelectionStep with paginated commentables after cursor with less ' +
      'commentables than count',
    async () => {
      await expect(
        graphql(
          ProposalStepProposalsCommentableQuery,
          {
            count: 2,
            after: 'Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx',
            id: toGlobalId('SelectionStep', 'selectionstep1'),
          },
          'internal',
        ),
      ).resolves.toMatchSnapshot();
    },
  );

  it(
    'fetches published proposals associated to a SelectionStep with paginated commentables after cursor with more ' +
      'commentables than count',
    async () => {
      await expect(
        graphql(
          ProposalStepProposalsCommentableQuery,
          {
            count: 5,
            after: 'Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx',
            id: toGlobalId('SelectionStep', 'selectionstep1'),
          },
          'internal',
        ),
      ).resolves.toMatchSnapshot();
    },
  );
});
