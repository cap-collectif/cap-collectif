/* eslint-env jest */
import '../../../_setup';

const UpdateProposalMutation = /* GraphQL */ `
  mutation ChangeProposalContent($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        body
      }
    }
  }
`;

describe('Internal | Update proposal content', () => {
  it('update proposal body with authorized iframe.', async () => {
    const updateProposal = await graphql(
      UpdateProposalMutation,
      {
        input: {
          id: 'UHJvcG9zYWw6cHJvcG9zYWw5MA==',
          body:
            '<iframe class="ql-video" frameborder="0" src="https://www.youtube.com/embed/qCNu_vJNLMQ?showinfo=0"></iframe>',
        },
      },
      'internal_admin',
    );
    expect(updateProposal).toMatchSnapshot();
  });

  it('update proposal body with unauthorized iframe.', async () => {
    const updateProposal = await graphql(
      UpdateProposalMutation,
      {
        input: {
          id: 'UHJvcG9zYWw6cHJvcG9zYWw5MA==',
          body:
            '<iframe class="ql-video" frameborder="0" src="https://www.hackers.com/embed/qCNu_vJNLMQ?showinfo=0"></iframe>',
        },
      },
      'internal_admin',
    );
    expect(updateProposal).toMatchSnapshot();
  });
});
