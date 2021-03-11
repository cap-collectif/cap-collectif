/* eslint-env jest */
import '../../_setup';

const UnTrashMutation = /* GraphQL */ `
  mutation UnTrashMutation($input: UnTrashInput!) {
    untrash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedReason
      }
    }
  }
`;

describe('Internal|Untrash', () => {
  it('try to untrash non trashable entity', async () => {
    await expect(
      graphql(
        UnTrashMutation,
        {
          input: {
            id: toGlobalId('Debate', 'debateCannabis'),
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('untrash argument', async () => {
    await expect(
      graphql(
        UnTrashMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument5'),
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('try to untrash argument not trashed', async () => {
    await expect(
      graphql(
        UnTrashMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument5'),
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
