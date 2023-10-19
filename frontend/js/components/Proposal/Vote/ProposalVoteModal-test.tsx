/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { ProposalVoteModal } from './ProposalVoteModal'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProposalVoteModalTestQuery } from '~relay/ProposalVoteModalTestQuery.graphql'

describe('<ProposalVoteModal />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const defaultMockResolvers = {
    Proposal: () => ({
      id: 'proposal1',
    }),
    Step: () => ({
      __typename: 'SelectionStep',
      id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
      __isProposalStep: 'SelectionStep',
      kind: 'selection',
      form: {
        proposalInAZoneRequired: false,
        objectType: 'PROPOSAL',
        contribuable: true,
        id: 'proposalformIdfBP3',
        step: {
          title: 'Collecte des projets Idf BRP 3',
          url: 'https://capco.dev/project/budget-participatif-idf-3/collect/collecte-des-projets-idf-brp-3',
          project: {
            title: 'Budget Participatif IdF 3',
            id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
            _id: 'projectIdf3',
            type: {
              title: 'project.types.participatoryBudgeting',
              id: '4',
            },
          },
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBJZGYz',
          slug: 'collecte-des-projets-idf-brp-3',
          __isProposalStep: 'CollectStep',
          form: {
            objectType: 'PROPOSAL',
            id: 'proposalformIdfBP3',
            districts: [
              {
                displayedOnMap: true,
                geojson: null,
                id: 'districtIdf3',
                border: null,
                background: null,
              },
              {
                displayedOnMap: true,
                geojson: null,
                id: 'districtIdf4',
                border: null,
                background: null,
              },
            ],
          },
        },
        description: "Whesh le BP3 c'est le feu",
        suggestingSimilarProposals: true,
        districts: [],
        categories: [],
        questions: [],
        usingDistrict: false,
        districtMandatory: false,
        districtHelpText: null,
        usingThemes: true,
        themeMandatory: false,
        usingCategories: true,
        categoryMandatory: true,
        categoryHelpText: null,
        usingAddress: true,
        titleHelpText: null,
        summaryHelpText: null,
        themeHelpText: null,
        illustrationHelpText: null,
        descriptionHelpText: null,
        addressHelpText: "Précisez l'adresse principale où sera mis en oeuvre votre projet",
        usingDescription: true,
        descriptionMandatory: true,
        usingSummary: true,
        usingIllustration: true,
        usingTipsmeee: false,
        tipsmeeeHelpText: null,
        usingFacebook: true,
        usingWebPage: true,
        usingTwitter: true,
        usingInstagram: true,
        usingYoutube: true,
        usingLinkedIn: true,
        isUsingAnySocialNetworks: true,
        mapCenter: {
          lat: 48.8499198,
          lng: 2.6370411,
        },
      },
      project: {
        type: {
          title: 'project.types.participatoryBudgeting',
          id: '4',
        },
        id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
        opinionCanBeFollowed: false,
      },
      proposals: {
        pageInfo: {
          hasNextPage: false,
          endCursor: 'YToyOntpOjA7ZDowLjIxMDA3MzM1O2k6MTtzOjI4OiJwcm9wb3NpdGlvblBvdXJUZXN0TGVEb3VibG9uIjt9',
          hasPreviousPage: false,
          startCursor: 'YToyOntpOjA7ZDowLjYxMjg0OTgzO2k6MTtzOjI3OiJwcm9wb3NhbEJ5RnJhbmNlQ29ubmVjdFVzZXIiO30=',
        },
        edges: [],
        totalCount: 2,
      },
      __isStep: 'SelectionStep',
      votesRanking: true,
      votesHelpText: null,
      viewerVotes: {
        totalCount: 0,
        edges: [],
      },
      votesMin: 1,
      __isRequirementStep: 'SelectionStep',
      requirements: {
        edges: [],
      },
      isSecretBallot: true,
      canDisplayBallot: false,
      publishedVoteDate: '2035-01-03 00:00:00',
      votesLimit: 3,
      open: true,
      voteType: 'SIMPLE',
      voteThreshold: 0,
      url: 'https://capco.dev/project/budget-participatif-idf-3/selection/vote-des-franciliens',
      allProposals: {
        totalCount: 2,
        fusionCount: 0,
      },
    }),
    Viewer: () => ({
      id: 'VXNlcjp1c2VyMQ==',
      phone: '+33766509155',
    }),
  }
  const query = graphql`
    query ProposalVoteModalTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!, $proposalId: ID = "<default>")
    @relay_test_operation {
      proposal: node(id: $proposalId) {
        ...ProposalVoteModal_proposal
      }
      step: node(id: $id) {
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated)
      }
      viewer {
        ...ProposalVoteModal_viewer
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProposalVoteModalTestQuery>(query, {
        proposalId: 'proposal1',
        isAuthenticated: true,
      })
      if (!data.proposal || !data.step) return null
      return <ProposalVoteModal proposal={data.proposal} step={data.step} viewer={data.viewer} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest
        useCapUIProvider
        store={{
          proposal: {
            currentVoteModal: 'proposal1',
          },
        }}
        environment={environment}
      >
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render correctly', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
