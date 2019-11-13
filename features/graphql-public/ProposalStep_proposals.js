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
  it('fetches published proposals associated to a collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, id: toGlobalId('CollectStep', 'collectstepVoteClassement') },
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
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a question collect step with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, id: toGlobalId('CollectStep', 'collectQuestionVoteAvecClassement') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, id: toGlobalId('SelectionStep', 'selectionstep1') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a status "Soumis au vote" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, status: 'status4', id: toGlobalId('SelectionStep', 'selectionstep1') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a district "Beauregard" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, district: 'district1', id: toGlobalId('SelectionStep', 'selectionstep1') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published proposals associated to a SelectionStep and a category "Aménagement" with a cursor', async () => {
    await expect(
      graphql(
        ProposalStepProposalsQuery,
        { count: 100, category: 'pCategory1', id: toGlobalId('SelectionStep', 'selectionstep1') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
