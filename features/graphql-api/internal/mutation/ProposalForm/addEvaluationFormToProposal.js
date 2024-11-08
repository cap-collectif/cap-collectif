import '../../../_setup';

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
    }`;

const input = {
  "evaluationFormId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNQ==",
  "proposalFormId": "proposalFormVote"
}

describe('mutations.setEvaluationFormInProposalFormInput', () => {
  it('wants to add an evaluation form to a proposal as admin', async () => {
    await expect(
      graphql(
        AddEvaluationFromToProposalMutation,
        { input: input },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
})