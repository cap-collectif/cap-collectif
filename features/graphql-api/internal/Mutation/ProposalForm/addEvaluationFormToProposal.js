import '../../../_setupDB'

const AddEvaluationFromToProposalMutation = /* GraphQL */ `
  mutation SetEvaluationFormInProposalFormMutation($input: SetEvaluationFormInProposalFormInput!) {
    setEvaluationFormInProposalForm(input: $input) {
      proposalForm {
        id
        evaluationForm {
          id
          title
        }
      }
    }
  }
`

const input = {
  evaluationFormId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNQ==',
  proposalFormId: 'proposalFormVote',
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.setEvaluationFormInProposalFormInput', () => {
  it('wants to add an evaluation form to a proposal as admin', async () => {
    await expect(
      graphql(AddEvaluationFromToProposalMutation, { input: input }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
