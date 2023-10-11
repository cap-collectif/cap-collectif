@opinion @other
Feature: createOpinion

@database
Scenario: GraphQL client wants to add an opinion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project5",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
          "opinionTypeId": "opinionType10",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "createOpinion": {
          "opinion": {
            "url": "https:\/\/capco.test\/consultations\/croissance-innovation-disruption\/consultation\/collecte-des-avis\/opinions\/les-enjeux\/le-titre"
          },
          "errorCode": null
        }
      }
    }
  """
  Then the queue associated to "opinion_create" producer has messages below:
  | 0 | {"opinionId": "@uuid@"} |

Scenario: Anonymous GraphQL client wants to add an opinion
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project5",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
          "opinionTypeId": "opinionType10",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"createOpinion":null}}
  """

Scenario: GraphQL client wants to add an opinion to a not enabled opinionType
  And I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project1",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=",
          "opinionTypeId": "opinionType1",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
  {"data":{"createOpinion":{"opinion":null,"errorCode":"OPINION_TYPE_NOT_ENABLED"}}}
  """

Scenario: GraphQL client wants to add an opinion without metting requirements
  Given I am logged in to graphql as user_without_phone
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project1",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=",
          "opinionTypeId": "opinionType9",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {"data":{"createOpinion":{"opinion":null,"errorCode":"REQUIREMENTS_NOT_MET"}}}
  """

@database 
Scenario: logged in GraphQL client can not add more than 2 opinions in a minute
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project1",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=",
          "opinionTypeId": "opinionType9",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project5",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
          "opinionTypeId": "opinionType10",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
        createOpinion(input: $input) {
          opinion {
            url
          }
          errorCode
        }
      }",
      "variables": {
        "input": {
          "projectId": "project5",
          "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
          "opinionTypeId": "opinionType10",
          "title": "le titre",
          "body": "<p>le body</p>",
          "appendices": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {"data":{"createOpinion":{"opinion":null,"errorCode":"CONTRIBUTED_TOO_MANY_TIMES"}}}
  """

@database
Scenario: GraphQL client wants to add an opinion with appendices
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
    """
      {
        "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
          createOpinion(input: $input) {
            opinion {
              title
            }
            errorCode
          }
        }",
        "variables": {
          "input": {
            "projectId": "project5",
            "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
            "opinionTypeId": "opinionType5",
            "title": "le titre",
            "body": "<p>le body</p>",
            "appendices": [
              {
                "appendixType": "1",
                "body": "Voici mon exposé des motifs"
              },
              {
                "appendixType": "2",
                "body": "Voici mon étude d'impact"
              }
            ]
          }
        }
      }
    """
  Then the JSON response should match:
    """
      {
        "data": {
          "createOpinion": {
            "opinion": {
              "title": "le titre"
            },
            "errorCode": null
          }
        }
      }
    """

Scenario: GraphQL client wants to add an opinion with an appendixType from a wrong opinionType
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
    """
      {
        "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
          createOpinion(input: $input) {
            opinion {
              title
            }
            errorCode
          }
        }",
        "variables": {
          "input": {
            "projectId": "project5",
            "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
            "opinionTypeId": "opinionType7",
            "title": "le titre",
            "body": "<p>le body</p>",
            "appendices": [
              {
                "appendixType": "3",
                "body": "Voici mon exposé des mensonges"
              }
            ]
          }
        }
      }
    """
  Then the JSON response should match:
    """
      {"data":{"createOpinion":{"opinion":null,"errorCode":"INVALID_FORM"}}}
    """

Scenario: GraphQL client wants to add an opinion from a wrong project
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
    """
      {
        "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
          createOpinion(input: $input) {
            opinion {
              title
            }
            errorCode
          }
        }",
        "variables": {
          "input": {
            "projectId": "abc",
            "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
            "opinionTypeId": "opinionType7",
            "title": "le titre",
            "body": "<p>le body</p>",
            "appendices": [
              {
                "appendixType": "3",
                "body": "Voici mon exposé des mensonges"
              }
            ]
          }
        }
      }
    """
  Then the JSON response should match:
    """
      {"data":{"createOpinion":{"opinion":null,"errorCode":"PROJECT_NOT_FOUND"}}}
    """

Scenario: GraphQL client wants to add an opinion from a wrong opinionType
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
    """
      {
        "query": "mutation CreateOpinion($input: CreateOpinionInput!) {
          createOpinion(input: $input) {
            opinion {
              title
            }
            errorCode
          }
        }",
        "variables": {
          "input": {
            "projectId": "project5",
            "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=",
            "opinionTypeId": "abc",
            "title": "le titre",
            "body": "<p>le body</p>",
            "appendices": [
              {
                "appendixType": "3",
                "body": "Voici mon exposé des mensonges"
              }
            ]
          }
        }
      }
    """
  Then the JSON response should match:
    """
      {"data":{"createOpinion":{"opinion":null,"errorCode":"OPINION_TYPE_NOT_FOUND"}}}
    """
