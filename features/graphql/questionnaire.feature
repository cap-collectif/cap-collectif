@questionnaire
Feature: Questionnaire

@database
Scenario: GraphQL client wants to retrieve questions
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire(id: 1) {
        questions {
          id
          title
          position
          private
          required
          helpText
          type
          isOtherAllowed
          validationRule {
            type
            number
          }
          choices {
            id
            title
            description
            color
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
        "questions": []
      }
    }
  }
  """
