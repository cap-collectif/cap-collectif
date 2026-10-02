import '../../_setupDB'

const UpdateOpinionMutation = /* GraphQL */ `
  mutation UpdateOpinionMutation($input: UpdateOpinionInput!) {
    updateOpinion(input: $input) {
      opinion {
        title
      }
      errorCode
    }
  }
`

const input = {
  opinionId: 'T3BpbmlvbjpvcGluaW9uMw==',
  title: 'new title',
  body: '<p>new body</p>',
  appendices: [],
}

describe('mutations.updateOpinionMutation', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should not update an opinion as anonymous', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should update an opinion as user', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal_user')).resolves.toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should update an opinion as admin', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
