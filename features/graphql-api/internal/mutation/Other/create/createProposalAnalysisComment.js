/* eslint-env jest */
import '../../../../_setup';

const CreateProposalAnalysisComment = /* GraphQL*/ `
  mutation CreateProposalAnalysisComment($input: CreateProposalAnalysisCommentInput!) {
    createProposalAnalysisComment(input: $input) {
      comment {
        body
        author {
          username
        }
      }
    }
  }
`;

const input = {
  "proposalAnalysisId": "UHJvcG9zYWxBbmFseXNpczpwcm9wb3NhbEFuYWx5c2lzMQ==",
  "body": "body du commentaire"
};


describe('CreateProposalAnalysisComments.createAnalysisComment', () => {
  it('assigned supervisor should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input
      },
      'internal_supervisor',
    );
    expect(response).toMatchSnapshot();
  });
  it('assigned analyst should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input
      },
      'internal_analyst',
    );
    expect(response).toMatchSnapshot();
  });
  it('assigned decision maker should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input
      },
      'internal_decision_maker',
    );
    expect(response).toMatchSnapshot();
  });
  it('supervisor not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input
        },
        'internal_supervisor2',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('analyst not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('decision maker not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
