/* eslint-env jest */
import '../../../_setup';

const DeleteDebateArgumentMutation = /* GraphQL */ `
  mutation DeleteDebateArgumentMutation($input: DeleteDebateArgumentInput!, $count: Int) {
    deleteDebateArgument(input: $input) {
      errorCode
      deletedDebateArgumentId
      debate {
        arguments(first: $count) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Mutation.deleteDebateArgument', () => {
  const deletedDebateArgumentId = toGlobalId('DebateArgument', 'debateArgument2');
  it('Remove debate argument', async () => {
    const response = await graphql(
      DeleteDebateArgumentMutation,
      {
        input: {
          id: toGlobalId('DebateArgument', 'debateArgument2'),
        },
        count: 10,
      },
      'internal_theo',
    );
    expect(
      response.deleteDebateArgument.debate.arguments.edges
        .map(edge => edge.node)
        .map(node => node.id)
        .includes(deletedDebateArgumentId),
    ).toBe(false);
  });
});
