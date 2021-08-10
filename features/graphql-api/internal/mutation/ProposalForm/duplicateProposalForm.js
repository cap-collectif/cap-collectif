/*eslint-env jest */
import '../../../_setup';

const duplicateProposalFormMutation = /* GraphQl */ `
  mutation DuplicateProposalForm($input: DuplicateProposalFormInput!) {
    duplicateProposalForm(input: $input) {
      duplicatedProposalForm {
        title
        owner {
          username
        }
      }
    }
  }
`;

describe('Internal | duplicateProposalForm', () => {
  it('cannot duplicate if not owner', async () => {
    await expect(
      graphql(
        duplicateProposalFormMutation,
        {
          input: {
            id: 'proposalForm1',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('duplicate own proposalForm', async () => {
    const response = await graphql(
      duplicateProposalFormMutation,
      {
        input: {
          id: 'proposalFormWithOwner',
        },
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('duplicate someone else proposalForm as admin', async () => {
    const response = await graphql(
      duplicateProposalFormMutation,
      {
        input: {
          id: 'proposalForm2',
        },
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
});
