/* eslint-env jest */
import '../../../_setup';

const SubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsRegistered($input: SubscribeToEventAsRegisteredInput!) {
    subscribeToEventAsRegistered(input: $input) {
      eventId
    }
  }
`;

const SubscribeToEventAsNonRegisteredMutation = /* GraphQL*/ `
  mutation SubscribeToEventAsNonRegistered($input: SubscribeToEventAsNonRegisteredInput!) {
    subscribeToEventAsNonRegistered(input: $input) {
      eventId
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

  it('user wants to subscribe from event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_user',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });
  it('anonymous wants to subscribe from event.', async () => {
    const subscribeToEvent = await graphql(
      SubscribeToEventAsNonRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0', email: 'jpec@cap-collectif.com', username: 'Jpec' },
      },
      'internal',
    );
    expect(subscribeToEvent).toMatchSnapshot();
  });
});
