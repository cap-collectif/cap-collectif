/* eslint-env jest */
import '../../../../_setup';

const ChangeEventMutation = /* GraphQL*/ `
    mutation ChangeEventMutation($input: ChangeEventInput!) {
        changeEvent(input: $input) {
            event {
                id
                title
                body
                author {
                    username
                }
                owner {
                    username
                }
                isMeasurable
                maxRegistrations
            }
        }
    }
`;

const input = {
  translations: [
    {
      title: 'title is updated',
      body: 'body is updated',
      locale: 'fr-FR',
    },
  ],
  startAt: '2020-01-01',
  guestListEnabled: false,
  measurable: true,
  maxRegistrations: 50,
};

describe('mutations.createEvent', () => {
  it('should update an event that a project admin owns', async () => {
    const response = await graphql(
      ChangeEventMutation,
      {
        input: {
          ...input,
          id: 'RXZlbnQ6ZXZlbnRXaXRoT3duZXI=',
        },
      },
      'internal_theo',
    );

    expect(response.changeEvent.event.title).toBe('title is updated');
    expect(response.changeEvent.event.body).toBe('body is updated');
    expect(response.changeEvent.event.owner.username).toBe('Théo QP');
    expect(response.changeEvent.event.author.username).toBe('Théo QP');
    expect(response.changeEvent.event.isMeasurable).toBe(true);
    expect(response.changeEvent.event.maxRegistrations).toBe(50);
  });

  it('should have an error when attempting to update a unknown event.', async () => {
    await expect(
      graphql(ChangeEventMutation, { input: { ...input, id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw error if project admin user attempt to update an event that he does not own', async () => {
    await expect(
      graphql(
        ChangeEventMutation,
        { input: { ...input, id: 'RXZlbnQ6ZXZlbnQz' } },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
