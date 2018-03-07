@questionnaire
Feature: Questionnaire

@database
Scenario: GraphQL client wants to retrieve questions
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "1") {
        ... on Questionnaire {
          questions {
            id
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "questionnaire": {
        "questions": [
          {"id":"2"},
          {"id":"13"},
          {"id":"14"},
          {"id":"15"},
          {"id":"16"},
          {"id":"18"},
          {"id":"19"}
        ]
      }
    }
  }
  """
