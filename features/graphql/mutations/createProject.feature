@project @admin
Feature: createProject

@database @dev
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
              username
              email
            }
          }
        }
      }",
      "variables": {
        "input": {
          "title": "thisisnotatest",
          "authors": ["userAdmin", "user1"],
          "opinionTerm": "2",
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
          "id":"UHJvamVjdDo1ZTMyMzAwZi04MjBiLTExZTktYThmNy0wMjQyYWMxMTAwMDQ=",
          "title":"thisisnotatest"
        }
      }
    }
  }
  """
