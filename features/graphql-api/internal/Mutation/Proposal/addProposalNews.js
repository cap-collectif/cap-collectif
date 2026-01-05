/* eslint-env jest */
import '../../../_setup'

const addProposalNews = /* GraphQL */ `
  mutation AddProposalNewsMutation($input: AddProposalNewsInput!) {
    addProposalNews(input: $input) {
      proposalPost {
        title
        translations {
          locale
          title
        }
      }
      errorCode
    }
  }
`

describe('Internal|add proposal news', () => {
  const input = {
    proposalId: toGlobalId('Proposal', 'lePetitCafe'),
    translations: [
      {
        locale: 'FR_FR',
        title: 'Look at Washington DC',
        body: 'This is the result of many years of fake news. So we have to fight against fake news. Algorithms create filter bubbles that persevere with fake news and conspiracy.',
        abstract: 'un résumé',
      },
    ],
  }
  it('add proposal news', async () => {
    const response = await graphql(addProposalNews, { input }, 'internal_user')
    expect(response).toMatchSnapshot()
  })

  it('fail to add proposal news, cause of project dont allow news', async () => {
    const response = await graphql(
      addProposalNews,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposal2'),
          translations: [
            {
              locale: 'FR_FR',
              title: 'User cant add news on this proposal',
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

  it('fail to add proposal news, cause of user not available', async () => {
    const response = await graphql(
      addProposalNews,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'lePetitCafe'),
          translations: [
            {
              locale: 'FR_FR',
              title: 'User is not proposal author',
              body: 'This is the result of many years of fake news. So we have to fight against fake news. Algorithms create filter bubbles that persevere with fake news and conspiracy.',
              abstract: 'un résumé',
            },
          ],
        },
      },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })

  it('fail to add proposal news, cause proposal not found', async () => {
    const response = await graphql(
      addProposalNews,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'leFauxCafé'),
          translations: [
            {
              locale: 'FR_FR',
              title: 'Proposal not found',
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
