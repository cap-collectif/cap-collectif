/* eslint-env jest */
import '../../../_setup';

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
        published
        publishableUntil
        notPublishedReason
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

  it('create unpublished argument', async () => {
    await expect(
      graphql(
        CreateDebateArgumentMutation,
        {
          input: {
            debate: toGlobalId('Debate', 'debateCannabis'),
            body: "J'ai plein de trucs à dire",
            type: 'FOR',
          },
        },
        'internal_not_confirmed',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('try to create argument but already done', async () => {
    await expect(
      graphql(
        CreateDebateArgumentMutation,
        {
          input: {
            debate: toGlobalId('Debate', 'debateCannabis'),
            body: "j'ai encore un truc à dire",
            type: 'FOR',
          },
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
});
