/* eslint-env jest */
import '../../../_setupDB'

const SubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsRegistered($input: SubscribeToEventAsRegisteredInput!) {
    subscribeToEventAsRegistered(input: $input) {
      event{
        id
      }
    }
  }
`

const SubscribeToEventAsNonRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsNonRegistered($input: SubscribeToEventAsNonRegisteredInput!) {
    subscribeToEventAsNonRegistered(input: $input) {
      event{
        id
      }
    }
  }
`

describe('mutations.subscribeToEvent', () => {
  it('admin wants to subscribe to an event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQz' },
      },
      'internal_admin',
    )
    expect(subscribeToEvent).toMatchSnapshot()
  })

  it('theo wants to subscribe to event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQx' },
      },
      'internal_theo',
    )
    expect(subscribeToEvent).toMatchSnapshot()
  })

  it('user wants to subscribe to a registered event.', async () => {
    // Event:event3 => max registrations : 2
    let eventId = 'RXZlbnQ6ZXZlbnQz'

    // We add 1 regisration from different user to reach the max registrations limit
    // One user is already registred for this event in database thanks to fixtures
    await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: eventId },
      },
      'internal_admin',
    )

    // We add a third registration to event to exceed max registrations limit
    await expect(
      graphql(
        SubscribeToEventAsRegisteredMutation,
        {
          input: { eventId: 'RXZlbnQ6ZXZlbnQz' },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Event is complete')
  })

  it('user wants to subscribe to a complete event.', async () => {
    await expect(
      graphql(
        SubscribeToEventAsRegisteredMutation,
        {
          input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Event is complete')
  })

  it('user wants to subscribe to event as anonymous.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQx', private: true },
      },
      'internal_user_conseil_regional',
    )
    expect(subscribeToEvent).toMatchSnapshot()
  })

  it('anonymous wants to subscribe to event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsNonRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQx', email: 'jpec@cap-collectif.com', username: 'Jpec' },
      },
      'internal',
    )
    expect(subscribeToEvent).toMatchSnapshot()
  })

  it('anonymous wants to subscribe to event as anonymous.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsNonRegisteredMutation,
      {
        input: {
          eventId: 'RXZlbnQ6ZXZlbnQx',
          email: 'jpec-anonymous@cap-collectif.com',
          username: 'Jpec',
          private: true,
        },
      },
      'internal',
    )
    expect(subscribeToEvent).toMatchSnapshot()
  })
  it('anonymous wants to subscribe ever subscribed event.', async () => {
    await graphql(
      SubscribeToEventAsNonRegisteredMutation,
      {
        input: {
          eventId: 'RXZlbnQ6ZXZlbnQx',
          email: 'jpec-anonymous@cap-collectif.com',
          username: 'Jpec',
          private: true,
        },
      },
      'internal',
    )

    await expect(
      graphql(
        SubscribeToEventAsNonRegisteredMutation,
        {
          input: {
            eventId: 'RXZlbnQ6ZXZlbnQx',
            email: 'jpec-anonymous@cap-collectif.com',
            username: 'Jpec',
            private: true,
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('User is already registered for this event.')
  })
  it('anonymous wants to subscribe to a complete event.', async () => {
    await expect(
      graphql(
        SubscribeToEventAsNonRegisteredMutation,
        {
          input: {
            eventId: 'RXZlbnQ6ZXZlbnQ0',
            email: 'jpec-anonymous@cap-collectif.com',
            username: 'Jpec',
            private: true,
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Event is complete')
  })
})
