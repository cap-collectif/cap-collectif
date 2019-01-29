@votes
Feature: Votes

@read-only
Scenario: GraphQL admin want to get all votes
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      votes(first: 5) {
        totalCount
        edges {
          node {
            __typename
            id
          }
        }
      }
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "votes": {
        "totalCount": 450,
        "edges": [
          {
            "node": {
              "__typename": "OpinionVote",
              "id": "T3BpbmlvblZvdGU6MQ=="
            }
          },
          {
            "node": {
              "__typename": "OpinionVote",
              "id": "T3BpbmlvblZvdGU6Mg=="
            }
          },
          {
            "node": {
              "__typename": "OpinionVote",
              "id": "T3BpbmlvblZvdGU6Mw=="
            }
          },
          {
            "node": {
              "__typename": "OpinionVote",
              "id": "T3BpbmlvblZvdGU6NA=="
            }
          },
          {
            "node": {
              "__typename": "OpinionVote",
              "id": "T3BpbmlvblZvdGU6NQ=="
            }
          }
        ]
      }
    }
  }
  """
