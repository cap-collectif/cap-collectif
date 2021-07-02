/* eslint-env jest */
import '../../../_setup';

const AddProposalsFromCsvMutation = /* GraphQL */ `
  mutation AddProposalsFromCsvMutation($input: AddProposalsFromCsvInput!) {
    addProposalsFromCsv(input: $input) {
      badLines
      duplicates
      mandatoryMissing
      importedProposals {
        edges {
          node {
            title
          }
        }
      }
      errorCode
    }
  }
`;

const input = {
  proposalFormId: 'proposalformIdfBP3',
  csvToImport: 'importedCsvProposals',
  dryRun: true,
  delimiter: ',',
};

describe('Internal mutation.addProposalsFromCsv', () => {
  it('should not import', async () => {
    const importProposals = await graphql(AddProposalsFromCsvMutation, { input }, 'internal_admin');
    expect(importProposals).toMatchSnapshot();
  });

  it('should import', async () => {
    const importInput = {
      ...input,
      dryRun: false,
    };

    const importProposals = await graphql(
      AddProposalsFromCsvMutation,
      { input: importInput },
      'internal_admin',
    );
    expect(importProposals).toMatchSnapshot();
  });
});
