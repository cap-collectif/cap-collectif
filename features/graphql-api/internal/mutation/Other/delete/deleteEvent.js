/* eslint-env jest */
import '../../../../_setup';

const DeleteEventMutation = /* GraphQL*/ `
    mutation DeleteEvent($input: DeleteEventInput!) {
        deleteEvent(input: $input) {
            deletedEventId
        }
    }
`;

describe('mutations.deletePost', () => {
  it('should throw an access denied when admin attempt to delete a unknown event.', async () => {
    await expect(
      graphql(DeleteEventMutation, { input: { eventId: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw an access denied when project admin user attempt to delete a event that he does not own', async () => {
    await expect(
      graphql(DeleteEventMutation, { input: { eventId: 'RXZlbnQ6ZXZlbnQz' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw an access denied when user attempt to delete a event where he is not the author', async () => {
    await expect(
      graphql(DeleteEventMutation, { input: { eventId: 'RXZlbnQ6ZXZlbnQz' } }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
