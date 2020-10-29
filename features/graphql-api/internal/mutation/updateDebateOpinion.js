/* eslint-env jest */
import '../../_setup';

const UpdateDebateOpinionMutation = /* GraphQL */ `
  mutation UpdateDebateOpinionMutation($input: UpdateDebateOpinionInput!) {
    updateDebateOpinion(input: $input) {
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

describe('Internal|UpdateDebateOpinion mutation', () => {
  it('Update a debate opinion.', async () => {
    const response = await graphql(
      UpdateDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
          title: 'Questionnaire non rattaché',
          body: 'Questionnaire non rattaché',
          type: 'FOR',
          author: toGlobalId('User', 'user5'),
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });

  it('Update partially a debate opinion.', async () => {
    const response = await graphql(
      UpdateDebateOpinionMutation,
      {
        input: {
          debateOpinionId: toGlobalId('DebateOpinion', 'debateCannabisOpinion1'),
          type: 'AGAINST',
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });
});
