@project @admin @admin
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
              createdAt
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
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet", "createdAt":"2015-01-01 00:00:00", "email":"lbrunet@jolicode.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot", "createdAt":"2015-01-02 00:00:00", "email":"sfavot@jolicode.com"},
            {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin", "createdAt":"2015-01-04 00:00:00", "email":"admin@test.com"}
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
              createdAt
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
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet", "createdAt":"2015-01-01 00:00:00", "email":"lbrunet@jolicode.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot", "createdAt":"2015-01-02 00:00:00", "email":"sfavot@jolicode.com"},
            {"id":"VXNlcjp1c2VyQWRtaW4=","username":"admin", "createdAt":"2015-01-04 00:00:00", "email":"admin@test.com"}
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
              createdAt
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

@database
Scenario: GraphQL client wants to add a locale to a project
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            locale {
              code
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "locale": "locale-fr-FR"
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
          "locale":{"code":"FR_FR"}
        }
      }
    }
   }
  """

@database
Scenario: GraphQL client wants to remove locale from a project
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            locale {
              code
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "locale": "locale-fr-FR"
        }
      }
    }
  """
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation ($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            locale {
              code
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "locale": null
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
          "locale":null
        }
      }
    }
   }
  """

@database
Scenario: GraphQL client wants to update project with empty group in custom view
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
        updateAlphaProject(input: $input) {
          project {
            id
            title
            restrictedViewers {
              edges {
                cursor
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }",
      "variables": {
        "input": {
          "title": "Je suis un projet simple",
          "Cover": "media1",
          "video": "https://www.youtube.com/watch?v=pjJ2w1FX_Wg",
          "authors": [
            "VXNlcjp1c2VyQWRtaW4=",
            "VXNlcjp1c2VyMQ=="
          ],
          "opinionTerm": 2,
          "metaDescription": "Je suis la super meta",
          "visibility": "CUSTOM",
          "themes": [
            "theme3"
          ],
          "isExternal": false,
          "publishedAt": "2019-03-01 12:00:00",
          "opinionCanBeFollowed": true,
          "steps": [],
          "districts": [],
          "projectId": "UHJvamVjdDpwcm9qZWN0Q29yb25h",
          "restrictedViewerGroups": []
        }
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "global.no_group_when_mandatory",
        "extensions": {
          "category": "user"
        },
        "@*@": "@*@"
      }
    ],
    "@*@": "@*@"
  }
  """
