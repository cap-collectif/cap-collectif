/* eslint-env jest */

const GroupMembersQuery = /* GraphQL */ `
    query GroupMembersQuery($groupId: ID!, $first: Int, $after: String, $term: String) {
        node(id: $groupId) {
            ...on Group {
                members(first: $first, after: $after, term: $term) {
                    totalCount
                    edges {
                        node {
                            email
                            username
                            type
                        }
                    }
                }
            }
        }
    }
`;

describe('Internal.Group.members', () => {
  it('should fetch all members of a group ', async () => {
    await expect(
      graphql(
        GroupMembersQuery,
        {
          groupId: toGlobalId('Group', 'group1'),
          first: 100,
          after: null,
          term: null
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should fetch first 2 members ', async () => {
    await expect(
      graphql(
        GroupMembersQuery,
        {
          groupId: toGlobalId('Group', 'group1'),
          first: 2,
          after: null,
          term: null
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should fetch members with username spyl ', async () => {
    await expect(
      graphql(
        GroupMembersQuery,
        {
          groupId: toGlobalId('Group', 'group1'),
          first: 100,
          after: null,
          term: "spyl"
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should fetch members with email msantostefano@cap-collectif.com ', async () => {
    await expect(
      graphql(
        GroupMembersQuery,
        {
          groupId: toGlobalId('Group', 'group1'),
          first: 100,
          after: null,
          term: "msantostefano@cap-collectif.com"
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should fetch members after lbrunet ', async () => {
    await expect(
      graphql(
        GroupMembersQuery,
        {
          groupId: toGlobalId('Group', 'group1'),
          first: 100,
          after: "YXJyYXljb25uZWN0aW9uOjA=",
          term: null
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
