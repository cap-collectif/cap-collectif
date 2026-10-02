/* eslint-env jest */
import '../../../../_setupDB'

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
`

const input = {
  proposalAnalysisId: 'UHJvcG9zYWxBbmFseXNpczpwcm9wb3NhbEFuYWx5c2lzMQ==',
  body: 'body du commentaire',
}

describe('CreateProposalAnalysisComments.createAnalysisComment', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('assigned supervisor should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input,
      },
      'internal_supervisor',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('assigned analyst should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input,
      },
      'internal_analyst',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('assigned decision maker should be able to comment an analysis.', async () => {
    const response = await graphql(
      CreateProposalAnalysisComment,
      {
        input,
      },
      'internal_decision_maker',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('supervisor not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input,
        },
        'internal_supervisor2',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('analyst not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input,
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('decision maker not assigned to this analysis should not be able to comment.', async () => {
    await expect(
      graphql(
        CreateProposalAnalysisComment,
        {
          input,
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
