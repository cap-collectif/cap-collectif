/* eslint-env jest */
import '../../../_setup';

const UnsubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation UnsubscribeToEventAsRegistered($input: UnsubscribeToEventAsRegisteredInput!) {
    unsubscribeToEventAsRegistered(input: $input) {
      eventId
    }
  }
`;

const UnsubscribeToEventAsNonRegisteredMutation = /* GraphQL*/ `
  mutation UnsubscribeToEventAsNonRegistered($input: UnsubscribeToEventAsNonRegisteredInput!) {
    unsubscribeToEventAsNonRegistered(input: $input) {
      eventId
    }
  }
`;

describe('mutations.unsubscribeToEvent', () => {
  it('admin wants to unsubscribe from event.', async () => {
    const unsubscribeToEvent = await graphql(
      UnsubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_spylou',
    );
    expect(unsubscribeToEvent).toMatchSnapshot();
  });
  it('user wants to unsubscribe from event.', async () => {
    const unsubscribeToEvent = await graphql(
      UnsubscribeToEventAsRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0' },
      },
      'internal_saitama',
    );
    expect(unsubscribeToEvent).toMatchSnapshot();
  });
  it('anonymous wants to unsubscribe from event.', async () => {
    const unsubscribeToEvent = await graphql(
      UnsubscribeToEventAsNonRegisteredMutation,
      {
        input: { eventId: 'RXZlbnQ6ZXZlbnQ0', email: 'jpec@benkyou.com', username: 'Jpec' },
      },
      'internal',
    );
    expect(unsubscribeToEvent).toMatchSnapshot();
  });
});
