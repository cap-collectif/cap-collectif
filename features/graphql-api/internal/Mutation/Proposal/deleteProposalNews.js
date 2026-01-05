/* eslint-env jest */
import '../../../_setup'

const deleteProposalNews = /* GraphQL */ `
  mutation deleteProposalNews($input: DeleteProposalNewsInput!) {
    deleteProposalNews(input: $input) {
      postId
      errorCode
    }
  }
`

describe('Internal|delete proposal news', () => {
  const input = {
    postId: 'UG9zdDpwb3N0MTc=',
  }
  it('delete proposal news', async () => {
    const response = await graphql(deleteProposalNews, { input }, 'internal_ian')
    expect(response).toMatchSnapshot()
  })

  it('fail to delete proposal news, cause of user not is not author', async () => {
    const response = await graphql(
      deleteProposalNews,
      {
        input: {
          postId: 'UG9zdDpwb3N0MTg=',
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })

  it('fail to delete proposal news, cause post not found', async () => {
    const response = await graphql(
      deleteProposalNews,
      {
        input: {
          postId: 'UG9zdDpwb3N0NDA0',
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })
})
