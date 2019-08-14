@reply @reply_responses
Feature: Responses for a reply

@security
Scenario: Anonymous wants to get responses on a reply for private results questionnaire
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($replyId: ID!) {
      reply: node(id: $replyId) {
          ... on Reply {
              responses {
                ... on ValueResponse {
                  value
                }
              }
          }
      }
    }",
    "variables": {
      "replyId": "reply8"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "reply": {
        "responses": []
      }
    }
  }
  """

@database
Scenario: User wants to get his responses on a reply for private results questionnaire
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($replyId: ID!) {
      reply: node(id: $replyId) {
          ... on Reply {
              responses {
                ... on ValueResponse {
                  value
                }
              }
          }
      }
    }",
    "variables": {
      "replyId": "reply8"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "reply": {
        "responses": [
          {"value":"secret"},
          {"value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"}
        ]
      }
    }
  }
  """

@database
Scenario: Admin wants to get responses on a reply for private results questionnaire
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($replyId: ID!) {
      reply: node(id: $replyId) {
          ... on Reply {
              responses {
                ... on ValueResponse {
                  value
                }
              }
          }
      }
    }",
    "variables": {
      "replyId": "reply8"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "reply": {
        "responses": [
          {"value":"secret"},
          {"value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"}
        ]
      }
    }
  }
  """
