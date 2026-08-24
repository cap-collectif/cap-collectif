/* eslint-env jest */

require('../../../_setupDB')

beforeEach(() => runSql('DELETE FROM user_connection WHERE datetime > "2017-01-01 00:06:00"'))

const UserConnectionsQuery = /* GraphQL */ `
  query UserConnectionsQuery($userId: ID!, $email: String, $success: Boolean) {
    connection: node(id: $userId) {
      ... on User {
        connectionAttempt(email: $email, success: $success) {
          totalCount
          edges {
            node {
              user {
                id
              }
              ipAddress
              datetime
              email
            }
          }
        }
      }
    }
  }
`

describe('Internal|User connection attempts', () => {
  it('returns successful connection attempts to an administrator', async () => {
    await expect(
      graphql(UserConnectionsQuery, { userId: toGlobalId('User', 'user1'), success: true }, 'internal_admin'),
    ).resolves.toEqual({
      connection: {
        connectionAttempt: {
          totalCount: 1,
          edges: [
            {
              node: {
                user: { id: toGlobalId('User', 'user1') },
                ipAddress: '192.168.64.1',
                datetime: '2017-01-01 00:06:00',
                email: 'lbrunet@cap-collectif.com',
              },
            },
          ],
        },
      },
    })
  })

  it('returns unsuccessful connection attempts filtered by email', async () => {
    await expect(
      graphql(
        UserConnectionsQuery,
        { userId: toGlobalId('User', 'user1'), email: 'lbrunet@cap-collectif.com', success: false },
        'internal_super_admin',
      ),
    ).resolves.toEqual({
      connection: {
        connectionAttempt: {
          totalCount: 5,
          edges: [
            '00:01:00',
            '00:02:00',
            '00:03:00',
            '00:04:00',
            '00:05:00',
          ].map(datetime => ({
            node: {
              user: null,
              ipAddress: '192.168.64.1',
              datetime: `2017-01-01 ${datetime}`,
              email: 'lbrunet@cap-collectif.com',
            },
          })),
        },
      },
    })
  })
})
