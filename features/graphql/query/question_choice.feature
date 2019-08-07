Feature: Get a question choice with a global id

@read-only2
Scenario: GraphQL admin want to get a question choice with its global id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($questionChoiceId: ID!){
      questionChoice: node(id: $questionChoiceId) {
        id
        __typename
        ...on QuestionChoice {
          title
        }
      }
    }",
    "variables": {
      "questionChoiceId": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "questionChoice": {
        "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux",
        "__typename": "QuestionChoice",
        "title": "Athlétisme"
      }
    }
  }
  """
