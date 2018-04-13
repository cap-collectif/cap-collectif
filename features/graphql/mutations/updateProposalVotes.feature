@proposals_votes
Feature: mutation updateProposalVotes

@database
Scenario: Logged in API client wants to delete everything
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalVotesInput!) {
      updateProposalVotes(input: $input) {
        step {
          id
          ... on SelectionStep {
            viewerVotes {
              totalCount
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "step": "selectionstep8",
        "votes": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalVotes": {
        "step": {
          "id": "selectionstep8",
          "viewerVotes": {
            "totalCount": 0
          }
        }
      }
    }
  }
  """

@database
Scenario: Logged in API client wants to delete everything
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalVotesInput!) {
      updateProposalVotes(input: $input) {
        step {
          id
          ... on SelectionStep {
            viewerVotes {
              totalCount
              edges {
                node {
                  id
                  anonymous
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "step": "selectionstep8",
        "votes": [
          { "id": "1053", "anonymous": true }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalVotes": {
        "step": {
          "id": "selectionstep8",
          "viewerVotes": {
            "totalCount": 1,
            "edges": [
              {
                "node": {
                  "id": "1053",
                  "anonymous": true
                }
              }
            ]
          }
        }
      }
    }
  }
  """

@database
Scenario: Logged in API client wants to reorder his votes
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalVotesInput!) {
      updateProposalVotes(input: $input) {
        step {
          id
          ... on CollectStep {
            viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
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
    }",
    "variables": {
      "input": {
        "step": "collectstepVoteClassement",
        "votes": [
          { "id": "2051", "anonymous": false },
          { "id": "2053", "anonymous": false },
          { "id": "2052", "anonymous": false }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalVotes": {
        "step": {
          "id": "collectstepVoteClassement",
          "viewerVotes": {
            "totalCount": 3,
            "edges": [
              {
                "node": {
                  "id": "2051"
                }
              },
              {
                "node": {
                  "id": "2053"
                }
              },
              {
                "node": {
                  "id": "2052"
                }
              }
            ]
          }
        }
      }
    }
  }
  """
