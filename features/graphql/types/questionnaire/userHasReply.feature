@questionnaire_userHasReply
Feature: questionnaire_userHasReply

@read-only
Scenario: API client wants to know if a user has reply to a questionnaire
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($questionnaireId: ID!, $loginA: String!, $loginB: String!, $loginC: String!) {
      questionnaire: node(id: $questionnaireId) {
        ... on Questionnaire {
          spylHasReply: userHasReply(login: $loginA)
          msantostefanoHasReply: userHasReply(login: $loginB)
          unknownUserHasReply: userHasReply(login: $loginC)
        }
      }
    }",
    "variables": {
      "questionnaireId": "questionnaire1",
      "loginA": "aurelien@cap-collectif.com",
      "loginB": "msantostefano@jolicode.com",
      "loginC": "unknown@gmail.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "questionnaire": {
        "spylHasReply": false,
        "msantostefanoHasReply": true,
        "unknownUserHasReply": false
      }
    }
  }
  """
