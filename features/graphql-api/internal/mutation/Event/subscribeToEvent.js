/* eslint-env jest */
import '../../../_setup';

const SubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsRegistered($input: SubscribeToEventAsRegisteredInput!) {
    subscribeToEventAsRegistered(input: $input) {
      event{
        id
      }
    }
  }
`;

const SubscribeToEventAsNonRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsNonRegistered($input: SubscribeToEventAsNonRegisteredInput!) {
    subscribeToEventAsNonRegistered(input: $input) {
      event{
        id
      }
    }
  }
`;

describe('mutations.subscribeToEvent', () => {
  it('admin wants to subscribe to an event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_admin',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });

  it('user wants to subscribe to event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_user',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });

  it('user wants to subscribe to event as anonymous.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0', private: true },
      },
      'internal_user_conseil_regional',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });

  it('anonymous wants to subscribe to event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsNonRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0', email: 'jpec@cap-collectif.com', username: 'Jpec' },
      },
      'internal',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });

  it('anonymous wants to subscribe to event as anonymous.', async () => {
    const subscribeToEvent = await graphql(
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
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });
});
