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
        "step": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
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
          "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
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
        "step": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
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
          "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
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
        "step": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==",
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
          "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==",
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

@database
Scenario: Logged in API client wants to reorder his votes on question
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
        "step": "Q29sbGVjdFN0ZXA6Y29sbGVjdFF1ZXN0aW9uVm90ZUF2ZWNDbGFzc2VtZW50",
        "votes": [
          { "id": "2054", "anonymous": false },
          { "id": "2055", "anonymous": false }
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
          "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdFF1ZXN0aW9uVm90ZUF2ZWNDbGFzc2VtZW50",
          "viewerVotes": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "2054"
                }
              },
              {
                "node": {
                  "id": "2055"
                }
              }
            ]
          }
        }
      }
    }
  }
  """
