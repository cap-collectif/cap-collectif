@proposal_comments
Feature: Proposal comments connections

@database
Scenario: Proposal comments should have next page if first argument is less than total count
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!, $count: Int) {
      proposal: node(id: $proposalId) {
        id
        ... on Proposal {
          comments(first: $count) {
            totalCount
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "proposal1",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "id": "proposal1",
        "comments": {
          "totalCount": 6,
          "pageInfo": {
            "hasNextPage": true
          },
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@database
Scenario: Proposal comments should not have next page if first argument is more than total count
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!, $count: Int) {
      proposal: node(id: $proposalId) {
        id
        ... on Proposal {
          comments(first: $count) {
            totalCount
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "proposal1",
      "count": 30
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "id": "proposal1",
        "comments": {
          "totalCount": 6,
          "pageInfo": {
            "hasNextPage": false
          },
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
