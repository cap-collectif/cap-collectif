/* eslint-env jest */

const TrashMutation = /* GraphQL */ `
  mutation TrashMutation($input: TrashInput!) {
    trash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedReason
      }
    }
  }
`;

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

describe('Internal|Trash', () => {
  it('try to trash non trashable entity', async () => {
    await expect(
      graphql(
        TrashMutation,
        {
          input: {
            id: toGlobalId('Debate', 'debateCannabis'),
            trashedStatus: 'INVISIBLE',
            trashedReason: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('trash argument', async () => {
    await expect(
      graphql(
        TrashMutation,
        {
          input: {
            id: toGlobalId('DebateArgument', 'debateArgument5'),
            trashedStatus: 'INVISIBLE',
            trashedReason: 'ON PEUT PLUS DIRE CA',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});

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
