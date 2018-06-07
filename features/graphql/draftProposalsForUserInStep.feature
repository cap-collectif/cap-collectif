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
                show_url
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "collectstep1"
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
                "show_url": "https:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/proposition-brouillon-3"
              }
          }
        ]
        }
      }
    }
  }
  """
