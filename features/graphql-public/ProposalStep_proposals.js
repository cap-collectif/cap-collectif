/* eslint-env jest */
const ProposalStepProposalsQuery = /* GraphQL */ `
  query ProposalStepProposalsQuery(
    $id: ID!
    $count: Int!
    $status: ID
    $district: ID
    $category: ID
    $cursor: String
    $orderBy: ProposalOrder
  ) {
    node(id: $id) {
      ... on ProposalStep {
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
                name
              }
              category {
                id
                name
              }
              status(step: $id) {
                id
                name
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
          orderBy: { field: 'COMMENTS', direction: 'DESC' },
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
          orderBy: { field: 'COMMENTS', direction: 'ASC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
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
          count: 100,
          id: toGlobalId('CollectStep', 'collectstepVoteClassement'),
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          district: 'district1',
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
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
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
