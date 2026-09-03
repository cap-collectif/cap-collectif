/* eslint-env jest */
import '../../../_setupES'

const ProposalFormEvaluationsQuery = /* GraphQL */ `
  query ProposalFormEvaluationsQuery {
    proposalForm: node(id: "proposalForm1") {
      ... on ProposalForm {
        step {
          title
          project {
            title
          }
        }
        proposals(first: 10, affiliations: [EVALUER]) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

const EvaluationFormQuestionsQuery = /* GraphQL */ `
  query EvaluationFormQuestionsQuery {
    proposalForm: node(id: "proposalForm1") {
      ... on ProposalForm {
        evaluationForm {
          questions {
            id
          }
        }
      }
    }
  }
`

const ProposalFormConfigurationQuery = /* GraphQL */ `
  query ProposalFormConfigurationQuery {
    proposalForm: node(id: "proposalForm1") {
      ... on ProposalForm {
        isGridViewEnabled
        isListViewEnabled
        isMapViewEnabled
      }
    }
  }
`

const ProposalFormSocialNetworksQuery = /* GraphQL */ `
  query ProposalFormSocialNetworksQuery {
    proposalForm: node(id: "proposalformIdfBP3") {
      ... on ProposalForm {
        usingWebPage
        usingTwitter
        usingFacebook
        usingInstagram
        usingYoutube
        usingLinkedIn
      }
    }
  }
`

describe('Internal|ProposalForm fields', () => {
  it('returns evaluations for the current user', async () => {
    await expect(graphql(ProposalFormEvaluationsQuery, {}, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('returns evaluation form questions to a user', async () => {
    await expect(graphql(EvaluationFormQuestionsQuery, {}, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('returns evaluation form questions to an anonymous user', async () => {
    await expect(graphql(EvaluationFormQuestionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns the proposal form view configuration', async () => {
    await expect(graphql(ProposalFormConfigurationQuery, {}, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('returns the proposal form social network configuration', async () => {
    await expect(graphql(ProposalFormSocialNetworksQuery, {}, 'internal_user')).resolves.toMatchSnapshot()
  })
})
