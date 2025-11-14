/* eslint-env jest */
import '../../../_setup'

const updateProposalNews = /* GraphQL */ `
  mutation updateProposalNews($input: UpdateProposalNewsInput!) {
    updateProposalNews(input: $input) {
      proposalPost {
        id
        title
        translations {
          body
          title
          abstract
        }
      }
      errorCode
    }
  }
`

describe('Internal|update proposal news', () => {
  const input = {
    postId: 'UG9zdDpwb3N0MTc=',
    translations: [
      {
        locale: 'FR_FR',
        title: 'Un nouveau titre',
        body: 'This is the result of many years of fake news. So we have to fight against fake news. Algorithms create filter bubbles that persevere with fake news and conspiracy.',
        abstract: 'un résumé',
      },
    ],
  }
  it('update proposal news', async () => {
    const response = await graphql(updateProposalNews, { input }, 'internal_ian')
    expect(response).toMatchSnapshot()
  })

  it('fail to update proposal news, cause of user not is not author', async () => {
    const response = await graphql(
      updateProposalNews,
      {
        input: {
          postId: 'UG9zdDpwb3N0MTg=',
          translations: [
            {
              locale: 'FR_FR',
              title: 'J essaie de modifier le titre',
              body: 'This is the result of many years of fake news. So we have to fight against fake news. Algorithms create filter bubbles that persevere with fake news and conspiracy.',
              abstract: 'un résumé',
            },
          ],
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })

  it('fail to update proposal news, cause post not found', async () => {
    const response = await graphql(
      updateProposalNews,
      {
        input: {
          postId: 'UG9zdDpwb3N0NDA0',
          translations: [
            {
              locale: 'FR_FR',
              title: 'Post not found',
              body: 'This is the result of many years of fake news. So we have to fight against fake news. Algorithms create filter bubbles that persevere with fake news and conspiracy.',
              abstract: 'un résumé',
            },
          ],
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })
})
