@proposal
Feature: Proposals

Scenario: GraphQL client wants to get list of available districts for a particular location
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      draftProposalsForUserInStep(stepId: $stepId) {
        title
        show_url
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
      "draftProposalsForUserInStep": [
        {
          "title": "Proposition brouillon 3",
          "show_url": "http:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/proposition-brouillon-3"
        }
      ]
    }
  }
  """

Scenario: Anonymous wants to get list of available districts for a particular location
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      draftProposalsForUserInStep(stepId: $stepId) {
        title
        show_url
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
      "draftProposalsForUserInStep": []
    }
  }
  """
