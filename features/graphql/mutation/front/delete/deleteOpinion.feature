@deleteOpinion @delete
Feature: Delete an opinion

@database
Scenario: Author wants to delete his opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
    {
        "query": "mutation ($input: DeleteOpinionInput!) {
            deleteOpinion(input: $input) {
                deletedOpinionId
            }
        }",
        "variables": {
            "input": {
                "opinionId": "T3BpbmlvbjpvcGluaW9uNTE="
            }
        }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "deleteOpinion": {
            "deletedOpinionId": "T3BpbmlvbjpvcGluaW9uNTE="
        }
    }
  }
  """

@security
Scenario: User wants to delete a version but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
    {
        "query": "mutation ($input: DeleteOpinionInput!) {
            deleteOpinion(input: $input) {
                deletedOpinionId
            }
        }",
        "variables": {
            "input": {
                "opinionId": "T3BpbmlvbjpvcGluaW9uMQ=="
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"You are not the author of opinion with id: opinion1","@*@": "@*@"}],"data":{"deleteOpinion":null}}
  """
