/*eslint-env jest */
import '../../../_setup';

const mutation = /* GraphQL */ `
  mutation DeleteProposalForm($input: DeleteProposalFormInput!) {
    deleteProposalForm(input: $input) {
      deletedProposalFormId
    }
  }
`;

describe('Internal | deleteProposalForm', () => {
  it('cannot delete non existing ProposalForm', async () => {
    await expect(
      graphql(
        mutation,
        {
          input: {
            id: 'proposalFormNone',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('NOT_FOUND');
  });
  it('cannot delete someone else ProposalForm', async () => {
    await expect(
      graphql(
        mutation,
        {
          input: {
            id: 'proposalForm1',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('delete own ProposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          id: 'proposalFormWithOwner',
        },
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('cannot delete someone else ProposalForm if admin', async () => {
    const response = await graphql(
      mutation,
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
