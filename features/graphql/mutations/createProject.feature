@project @admin
Feature: createProject

@database
Scenario: GraphQL client wants to create a project
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: CreateProjectInput!) {
        createProject(input: $input) {
          project {
            title
            authors {
              id
              username
              email
            }
            visibility
          }
        }
      }",
      "variables": {
        "input": {
          "title": "thisisnotatest",
          "authors": ["VXNlcjp1c2VyQWRtaW4=", "VXNlcjp1c2VyMQ=="],
          "opinionTerm": 2,
          "projectType": "2"
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "createProject":{
          "project":{
            "title": "thisisnotatest",
            "authors":[
              {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin","email":"admin@test.com"},
              {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet","email":"lbrunet@jolicode.com"}
            ],
            "visibility":"ADMIN"
          }
        }
      }
    }
  """

@database
Scenario: GraphQL client wants to create a project without type
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: CreateProjectInput!) {
        createProject(input: $input) {
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
          "title": "thisisnotatest",
          "authors": ["VXNlcjp1c2VyQWRtaW4=", "VXNlcjp1c2VyMQ=="],
          "opinionTerm": 2
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "createProject":{
          "project":{
            "title": "thisisnotatest",
            "authors":[
              {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin","email":"admin@test.com"},
              {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet","email":"lbrunet@jolicode.com"}
            ],
            "type": null
          }
        }
      }
    }
  """
