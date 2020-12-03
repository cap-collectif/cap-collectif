/* eslint-env jest */

const CreateDebateArgumentMutation = /* GraphQL */ `
  mutation CreateDebateArgumentMutation($input: CreateDebateArgumentInput!) {
    createDebateArgument(input: $input) {
      errorCode
      debateArgument {
        debate {
          id
        }
        author {
          id
        }
        body
        type
      }
    }
  }
`;

describe('Internal|CreateDebateArgument', () => {
  it('try to create argument with wrong debate id', async () => {
    await expect(
      graphql(
        CreateDebateArgumentMutation,
        {
          input: {
            debate: 'wrongId',
            body: "oups je me suis trompé d'id pour le débat",
            type: 'FOR',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('create argument', async () => {
    await expect(
      graphql(
        CreateDebateArgumentMutation,
        {
          input: {
            debate: toGlobalId('Debate', 'debateCannabis'),
            body: "j'ai des trucs à dire",
            type: 'FOR',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
