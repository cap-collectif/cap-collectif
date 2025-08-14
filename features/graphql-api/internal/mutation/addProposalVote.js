/* eslint-env jest */
import '../../_setup';

const AddProposalVoteMutation = /* GraphQL*/ `
    mutation ($input: AddProposalVoteInput!) {
        addProposalVote(input: $input) {
            vote {
                id
            }
        }
    }
`;


describe('mutations.addProposalVoteMutation', () => {
    it('admin should ask a revision on proposal.', async () => {
        await expect(
          graphql(
            AddProposalVoteMutation,
            { input: {
                "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
                "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
              }},
            'internal_user',
          ),
        ).rejects.toThrowError('You have reached the limit of votes.')
    });
})