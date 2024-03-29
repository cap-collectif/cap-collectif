/* eslint-env jest */
import '../../../_setup';

const AddDebateOpinionMutation = /* GraphQL */ `
  mutation AddDebateOpinionMutation($input: AddDebateOpinionInput!) {
    addDebateOpinion(input: $input) {
      errorCode
      debateOpinion {
        id
        debate {
          id
        }
        title
        body
        type
        author {
          id
        }
      }
    }
  }
`;

describe('Internal|addDebateOpinion mutation', () => {
  it('Add a debate opinion.', async () => {
    const response = await graphql(
      AddDebateOpinionMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          title: 'Je suis pour',
          body:
            '<strong>Légaliser le cannabis</strong>, contrairement à ce que beaucoup de personnes pensent, veut dire le contrôler.',
          author: toGlobalId('User', 'user5'),
          type: 'FOR',
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot({
      addDebateOpinion: {
        debateOpinion: {
          id: expect.any(String),
        },
      },
    });
  });

  it('Add a debate opinion with an iframe.', async () => {
    const body =
      'oh allez <iframe class="ql-video" src="https://www.youtube.com/embed/NRWem9fpByg?showinfo=0" frameborder="0"></iframe>';
    const response = await graphql(
      AddDebateOpinionMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          title: 'Je suis pour',
          body: body,
          author: toGlobalId('User', 'user5'),
          type: 'FOR',
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot({
      addDebateOpinion: {
        debateOpinion: {
          id: expect.any(String),
          body: body,
        },
      },
    });
  });
});
