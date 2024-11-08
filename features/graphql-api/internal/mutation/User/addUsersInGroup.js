import '../../../_setup';

const AddUsersInGroupMutation = /* GraphQL */ `
  mutation AddUsersInGroup($input: AddUsersInGroupInput!) {
      addUsersInGroup(input: $input) {
        group {
          id
          users {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }`;

const input = {
  "groupId": "R3JvdXA6Z3JvdXAy",
  "users": [
    "VXNlcjp1c2VyMTAx"
  ]
}

const inputMultiple = {
  "groupId": "R3JvdXA6Z3JvdXAy",
  "users": [
    "VXNlcjp1c2VyMTAx",
    "VXNlcjp1c2VyMTA3"
  ]
}

describe('mutations.addUsersInGroupInput', () => {
  it('wants to add a user in group as admin', async () => {
    await expect(
      graphql(
        AddUsersInGroupMutation,
        { input: input },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('wants to add multiple users in group as admin', async () => {
    await expect(
      graphql(
        AddUsersInGroupMutation,
        { input: inputMultiple },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
})