/* eslint-env jest */
import '../../../_setup';

const DeleteDebateArgumentMutation = /* GraphQL */ `
  mutation DeleteDebateArgumentMutation($input: DeleteDebateArgumentInput!) {
    deleteDebateArgument(input: $input) {
      errorCode
      deletedDebateArgumentId
    }
  }
`;

describe('Internal|DeleteDebateArgument', () => {
  it('try to delete argument with wrong id', async () => {
    await expect(
      graphql(
        DeleteDebateArgumentMutation,
        {
          input: {
            id: 'wrongId',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('try to delete argument of someone else', async () => {
    await expect(
      graphql(
        DeleteDebateArgumentMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument1'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('delete argument', async () => {
    await expect(
      graphql(
        DeleteDebateArgumentMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument1'),
          },
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('admin delete argument of someone else', async () => {
    await expect(
      graphql(
        DeleteDebateArgumentMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument3'),
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
