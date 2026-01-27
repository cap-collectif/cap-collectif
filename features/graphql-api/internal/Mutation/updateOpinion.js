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
  it('should not update an opinion as anonymous', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
  it('should update an opinion as user', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal_user')).resolves.toMatchSnapshot()
  })
  it('should update an opinion as admin', async () => {
    await expect(graphql(UpdateOpinionMutation, { input: input }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
