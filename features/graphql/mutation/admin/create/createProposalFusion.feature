@proposal @create_proposal_fusion @admin
Feature: Create Proposal Fusion

@database
Scenario: GraphQL client wants to create a fusion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFusionInput!) {
      createProposalFusion (input: $input) {
        proposal {
          author {
            id
          }
          title
          adminUrl
          mergedFrom {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "fromProposals": ["UHJvcG9zYWw6cHJvcG9zYWwx", "UHJvcG9zYWw6cHJvcG9zYWwy"],
        "title": "Test fusion"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposalFusion": {
        "proposal": {
          "author": {
            "id": "VXNlcjp1c2VyQWRtaW4="
          },
          "title": "Test fusion",
          "adminUrl": @string@,
          "mergedFrom": [
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
            },
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
            }
          ]
        }
      }
    }
  }
  """

@security
Scenario: GraphQL client wants to create a fusion with only 1 proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFusionInput!) {
      createProposalFusion (input: $input) {
        proposal {
          id
          mergedFrom {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "fromProposals": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "title": "Test fusion"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [{"message":"You must specify at least 2 proposals to merge.","@*@": "@*@"}],
    "data": {
      "createProposalFusion": null
    }
  }
  """

@security
Scenario: GraphQL client wants to create a fusion with proposals from different forms
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFusionInput!) {
      createProposalFusion (input: $input) {
        proposal {
          id
          mergedFrom {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "fromProposals": ["UHJvcG9zYWw6cHJvcG9zYWwx", "UHJvcG9zYWw6cHJvcG9zYWw4"],
        "title": "Test fusion"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [{"message":"All proposals to merge should have the same proposalForm.","@*@": "@*@"}],
    "data": {
      "createProposalFusion": null
    }
  }
  """
