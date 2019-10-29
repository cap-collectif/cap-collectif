@project @admin
Feature: updateProject

@database
Scenario: GraphQL client wants to update a project and add an author
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            title
            authors {
              id
              username
              email
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "title": "thisisnotatestupdated",
          "authors": ["VXNlcjp1c2VyQWRtaW4=", "VXNlcjp1c2VyMQ==", "VXNlcjp1c2VyMg=="],
          "opinionTerm": 1,
          "projectType": "2"
        }
      }
    }
  """
  Then the JSON response should match:
  """
   {
    "data":{
      "updateProject":{
        "project":{
          "title":"thisisnotatestupdated",
          "authors":[
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet","email":"lbrunet@jolicode.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot","email":"sfavot@jolicode.com"},
            {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin","email":"admin@test.com"}
          ]
        }
      }
    }
   }
  """

@database
Scenario: GraphQL client wants to update a project and delete an author
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            title
            authors {
              id
              username
              email
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "title": "thisisnotatestupdated",
          "authors": ["VXNlcjp1c2VyMg=="],
          "opinionTerm": 1,
          "projectType": "2"
        }
      }
    }
  """
  Then the JSON response should match:
  """
   {
    "data":{
      "updateProject":{
        "project":{
          "title":"thisisnotatestupdated",
          "authors":[
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot","email":"sfavot@jolicode.com"}
          ]
        }
      }
    }
   }
  """

@database
Scenario: GraphQL client wants to update a project without type
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            title
            authors {
              id
              username
              email
            }
            type {
              title
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "title": "thisisnotatestupdated",
          "authors": ["VXNlcjp1c2VyQWRtaW4=", "VXNlcjp1c2VyMQ==", "VXNlcjp1c2VyMg=="],
          "opinionTerm": 1,
          "projectType": null
        }
      }
    }
  """
  Then the JSON response should match:
  """
   {
    "data":{
      "updateProject":{
        "project":{
          "title":"thisisnotatestupdated",
          "authors":[
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet","email":"lbrunet@jolicode.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot","email":"sfavot@jolicode.com"},
            {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin","email":"admin@test.com"}
          ],
          "type": null
        }
      }
    }
   }
  """

@database
Scenario: GraphQL client wants to update a project without authors
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            title
            authors {
              id
              username
              email
            }
            type {
              title
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "title": "thisisnotatestupdated",
          "authors": [],
          "opinionTerm": 1,
          "projectType": null
        }
      }
    }
  """
  Then the JSON response should match:
  """
{"errors":[{"message":"You must specify at least one author.","@*@": "@*@"}],"data":{"updateProject":null}}
  """
