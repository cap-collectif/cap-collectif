/* eslint-env jest */
import '../../_setup';

const ChangeProposalPublicationStatus = /* GraphQL */ `
  mutation ChangeProposalPublicationStatusMutation(
    $input: ChangeProposalPublicationStatusInput!
  ) {
    changeProposalPublicationStatus(input: $input) {
      proposal {
        publicationStatus
      }
    }
  }
`;

describe('mutations.changeProposalPublicationStatus', () => {
  it("should update the status to ARCHIVED", async () => {
    const createAnalysis = await graphql(
      ChangeProposalPublicationStatus,
      {
        "input": {
          "publicationStatus": "ARCHIVED",
          "proposalId": "UHJvcG9zYWw6cHJvcG9zYWxBcmNoaXZpbmdTdGVwQXJjaGl2ZWQ="
        },
      },
      'internal_admin',
    );
    expect(createAnalysis).toMatchSnapshot();
  });
})
