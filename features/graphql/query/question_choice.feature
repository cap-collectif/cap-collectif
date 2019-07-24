Feature: Get a question choice with a global id

@read-only
Scenario: GraphQL admin want to get a question choice with its global id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    query getQuestionChoice {
      node(id: "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux") {
        id
        __typename
        ... on QuestionChoice{
          id,
          title
        }
      }
    }
  }
  """
  Then the JSON response should match:
    """
  {
    "data": {
      "node": {
        "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux",
        "__typename": "QuestionChroice",
        "title": "Athlétisme"
      }
    }
  }
  """
