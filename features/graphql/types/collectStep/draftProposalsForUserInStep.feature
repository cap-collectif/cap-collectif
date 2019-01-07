@proposal
Feature: Proposals

Scenario: GraphQL client wants to get list of draft proposals
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on CollectStep {
          viewerProposalDrafts {
            edges {
              node {
                title
                url
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "viewerProposalDrafts": {
          "edges": [
          {
              "node": {
                "title": "Proposition brouillon 3",
                "url": "https:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/proposition-brouillon-3"
              }
          }
        ]
        }
      }
    }
  }
  """
