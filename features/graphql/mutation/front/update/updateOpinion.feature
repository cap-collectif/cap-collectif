@opinions @update
Feature: updateOpinion

@database
Scenario: GraphQL client wants to update an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation UpdateOpinion($input: UpdateOpinionInput!) {
        updateOpinion(input: $input) {
          opinion {
            title
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "opinionId": "T3BpbmlvbjpvcGluaW9uMw==",
          "title": "new title",
          "body": "<p>new body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "updateOpinion": {
          "opinion": {
            "title": "new title"
          },
          "errorCode": null
        }
      }
    }
  """

@database
Scenario: Anonymous GraphQL client wants to update an opinion
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation UpdateOpinion($input: UpdateOpinionInput!) {
        updateOpinion(input: $input) {
          opinion {
            title
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "opinionId": "T3BpbmlvbjpvcGluaW9uMw==",
          "title": "new title",
          "body": "<p>new body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"updateOpinion":null}}
  """

@database
Scenario: Anonymous GraphQL client wants to update an opinion but is not the author
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation UpdateOpinion($input: UpdateOpinionInput!) {
        updateOpinion(input: $input) {
          opinion {
            title
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "opinionId": "T3BpbmlvbjpvcGluaW9uMw==",
          "title": "new title",
          "body": "<p>new body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {"data":{"updateOpinion":{"opinion":null,"errorCode":"NOT_AUTHORIZED"}}}
  """