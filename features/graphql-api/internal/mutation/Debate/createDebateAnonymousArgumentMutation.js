/* eslint-env jest */
import '../../../_setup';

const CreateDebateAnonymousArgumentMutation = /* GraphQL */ `
  mutation CreateDebateAnonymousArgumentMutation($input: CreateDebateAnonymousArgumentInput!) {
    createDebateAnonymousArgument(input: $input) {
      errorCode
      debateArgument {
        debate {
          id
        }
        body
        type
        published
        username
      }
    }
  }
`;

describe('Internal|CreateDebateAnonymousArgument', () => {
  it('try to create argument with wrong debate id', async () => {
    await expect(
      graphql(
        CreateDebateAnonymousArgumentMutation,
        {
          input: {
            debate: 'wrongId',
            body: "oups je me suis trompé d'id pour le débat",
            type: 'FOR',
            username: 'jean-mi',
            email: 'jeanmi64@laposte.fr',
          },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('try to create a second argument', async () => {
    await expect(
      graphql(
        CreateDebateAnonymousArgumentMutation,
        {
          input: {
            debate: toGlobalId('Debate', 'debateCannabis'),
            body: 'je veux dire aussi que',
            type: 'FOR',
            email: 'jeannine1957@laposte.fr',
          },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('create argument', async () => {
    await expect(
      graphql(
        CreateDebateAnonymousArgumentMutation,
        {
          input: {
            debate: toGlobalId('Debate', 'debateCannabis'),
            body: "j'ai des trucs à dire",
            type: 'FOR',
            username: 'jean-mi',
            email: 'jeanmi64@laposte.fr',
          },
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
