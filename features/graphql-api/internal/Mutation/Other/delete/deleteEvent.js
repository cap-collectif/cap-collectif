/* eslint-env jest */
import '../../../../_setupDB'

const DeleteEventMutation = /* GraphQL*/ `
    mutation ($input: DeleteEventInput!) {
      deleteEvent(input: $input) {
        deletedEventId
        event {
          deletedAt
          author {
            ...on User {
              _id
            }
          }
          timeRange {
            startAt
            endAt
          }
          themes {
            id
          }
          projects {
            id
          }
          media {
            id
          }
          review {
            reviewer {
              id
              username
            }
            createdAt
          }
          commentable
          comments(first: 5) {
            totalCount
          }
          googleMapsAddress {
            json
            formatted
          }
          participants(first: 5) {
            totalCount
          }
          translations {
            body
          }
        }
      }
    }
`

describe('mutations.deleteEvent', () => {
  it('should throw an access denied when admin attempt to delete a unknown event.', async () => {
    await expect(graphql(DeleteEventMutation, { input: { eventId: 'abc' } }, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it('should throw an access denied when project admin user attempt to delete a event that he does not own', async () => {
    await expect(
      graphql(DeleteEventMutation, { input: { eventId: 'RXZlbnQ6ZXZlbnQz' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('should throw an access denied when user attempt to delete a event where he is not the author', async () => {
    await expect(
      graphql(DeleteEventMutation, { input: { eventId: 'RXZlbnQ6ZXZlbnQz' } }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('Logged in API admin wants delete his event', async () => {
    await expect(
      graphql(
        DeleteEventMutation,
        {
          input: {
            eventId: 'RXZlbnQ6ZXZlbmVtZW50RnV0dXJlU2Fuc0RhdGVEZUZpbg==',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      deleteEvent: {
        event: {
          deletedAt: expect.any(String),
        },
      },
    })
  })

  it('Logged in API super admin wants delete his event', async () => {
    await expect(
      graphql(
        DeleteEventMutation,
        {
          input: {
            eventId: 'RXZlbnQ6ZXZlbnQx',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot({
      deleteEvent: {
        event: {
          deletedAt: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants delete his event', async () => {
    await expect(
      graphql(
        DeleteEventMutation,
        {
          input: {
            eventId: 'RXZlbnQ6ZXZlbnQx',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      deleteEvent: {
        event: {
          deletedAt: expect.any(String),
        },
      },
    })
  })
})
