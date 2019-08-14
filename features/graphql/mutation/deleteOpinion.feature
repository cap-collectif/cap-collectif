@deleteOpinion
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
                "opinionId": "opinion51"
            }
        }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "deleteOpinion": {
            "deletedOpinionId": "opinion51"
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
                "opinionId": "opinion1"
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"You are not the author of opinion with id: opinion1","category":"user","locations":[@...@],"path":["deleteOpinion"]}],"data":{"deleteOpinion":null}}
  """
