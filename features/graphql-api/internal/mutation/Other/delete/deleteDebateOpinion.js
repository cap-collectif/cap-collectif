/* eslint-env jest */
import '../../../../_setup';

const DeleteDebateOpinionMutation = /* GraphQL */ `
  mutation DeleteDebateOpinionMutation($input: DeleteDebateOpinionInput!) {
    deleteDebateOpinion(input: $input) {
      debate {
        id
      }
      deletedDebateOpinionId
      errorCode
    }
  }
`;

describe('Internal|DeleteDebateOpinion mutation', () => {
  it('Delete a debate opinion.', async () => {
    const response = await graphql(
      DeleteDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
        },
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
});
