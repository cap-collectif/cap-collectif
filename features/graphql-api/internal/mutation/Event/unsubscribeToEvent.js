/* eslint-env jest */
import '../../../_setup';

const UnsubscribeToEventAsRegisteredMutation = /* GraphQL*/ `
  mutation UnsubscribeToEventAsRegistered($input: UnsubscribeToEventAsRegisteredInput!) {
    unsubscribeToEventAsRegistered(input: $input) {
      event{
        id
      }
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
});
