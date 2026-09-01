/* eslint-env jest */
import '../../../_setupDB'

const AddProposalsFromCsvMutation = /* GraphQL */ `
  mutation AddProposalsFromCsvMutation($input: AddProposalsFromCsvInput!) {
    addProposalsFromCsv(input: $input) {
      badLines
      duplicates
      mandatoryMissing
      importableProposals
      importedProposals {
        edges {
          node {
            title
            webPageUrl
            facebookUrl
          }
        }
      }
      errorCode
    }
  }
`

const AddProposalsFromCsvWithLineErrorsMutation = /* GraphQL */ `
  mutation AddProposalsFromCsvWithLineErrorsMutation($input: AddProposalsFromCsvInput!) {
    addProposalsFromCsv(input: $input) {
      badLines
      lineErrors {
        line
        reason
        field
        expected
        actual
        duplicateOfLine
      }
      duplicates
      mandatoryMissing
      importableProposals
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
`

const input = {
  proposalFormId: 'proposalformIdfBP3',
  csvToImport: 'importedCsvProposals',
  dryRun: true,
  delimiter: ',',
}

describe('Internal mutation.addProposalsFromCsv', () => {
  it('should not import', async () => {
    const importProposals = await graphql(AddProposalsFromCsvMutation, { input }, 'internal_admin')
    expect(importProposals).toMatchSnapshot()
  })

  it('should report every row that violates a text length constraint', async () => {
    const importProposals = await graphql(
      AddProposalsFromCsvWithLineErrorsMutation,
      {
        input: {
          ...input,
          csvToImport: 'importedCsvProposalsBadLengths',
        },
      },
      'internal_admin',
    )

    expect(importProposals).toEqual({
      addProposalsFromCsv: {
        badLines: [2, 3, 4, 5, 6],
        lineErrors: [
          {
            line: 2,
            reason: 'TITLE_TOO_SHORT',
            field: 'title',
            expected: '3..255 characters',
            actual: '2',
            duplicateOfLine: null,
          },
          {
            line: 3,
            reason: 'TITLE_TOO_LONG',
            field: 'title',
            expected: '3..255 characters',
            actual: '256',
            duplicateOfLine: null,
          },
          {
            line: 4,
            reason: 'SUMMARY_TOO_SHORT',
            field: 'summary',
            expected: '2..140 characters',
            actual: '1',
            duplicateOfLine: null,
          },
          {
            line: 5,
            reason: 'SUMMARY_TOO_LONG',
            field: 'summary',
            expected: '2..140 characters',
            actual: '141',
            duplicateOfLine: null,
          },
          {
            line: 6,
            reason: 'DESCRIPTION_TOO_SHORT',
            field: 'body',
            expected: '3 characters minimum',
            actual: '2',
            duplicateOfLine: null,
          },
        ],
        duplicates: [],
        mandatoryMissing: [],
        importableProposals: 0,
        importedProposals: {
          edges: [],
        },
        errorCode: null,
      },
    })
  })

  it('should import as admin', async () => {
    const importInput = {
      ...input,
      dryRun: false,
    }

    const importProposals = await graphql(AddProposalsFromCsvMutation, { input: importInput }, 'internal_admin')
    expect(importProposals).toMatchSnapshot()
  })
  it('should import as project admin', async () => {
    const importInput = {
      ...input,
      dryRun: false,
    }

    const importProposals = await graphql(AddProposalsFromCsvMutation, { input: importInput }, 'internal_theo')
    expect(importProposals).toMatchSnapshot()
  })
  it('should not import when project admin is not owner', async () => {
    await expect(
      graphql(
        AddProposalsFromCsvMutation,
        {
          input,
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
