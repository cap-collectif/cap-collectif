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
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet", "createdAt":"2015-01-01 00:00:00", "email":"lbrunet@cap-collectif.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot", "createdAt":"2015-01-02 00:00:00", "email":"sfavot@cap-collectif.com"},
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
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot","email":"sfavot@cap-collectif.com"}
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
            {"id":"VXNlcjp1c2VyMQ==","username":"lbrunet", "createdAt":"2015-01-01 00:00:00", "email":"lbrunet@cap-collectif.com"},
            {"id":"VXNlcjp1c2VyMg==","username":"sfavot", "createdAt":"2015-01-02 00:00:00", "email":"sfavot@cap-collectif.com"},
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
          "locale": "locale-en-GB"
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
          "locale":{"code":"EN_GB"}
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
          "locale": "locale-en-GB"
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
            archived
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
          "restrictedViewerGroups": [],
          "archived": false
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

@database
Scenario: GraphQL client wants to update project with votesMin greater than votesLimit
  Given I am logged in to graphql as admin
  And feature "votes_min" is enabled
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
        updateAlphaProject(input: $input) {
          project {
            title
            steps {
              ... on ConsultationStep {
                consultations {
                  totalCount
                  edges {
                    node {
                      id
                      title
                    }
                  }
                }
              }
              ... on CollectStep {
                votesMin
                votesLimit
              }
              ... on SelectionStep {
                votesMin
                votesLimit
              }
            }
            archived
          }
        }
      }",
      "variables": {
         "input":{
            "projectId":"UHJvamVjdDpwcm9qZWN0Q29yb25h",
            "restrictedViewerGroups":[

            ],
            "title":"Je suis un projet simple",
            "Cover":"media1",
            "video":"https://www.youtube.com/watch?v=pjJ2w1FX_Wg",
            "authors":[
               "VXNlcjp1c2VyQWRtaW4=",
               "VXNlcjp1c2VyMQ=="
            ],
            "metaDescription":"Je suis la super meta",
            "visibility":"PUBLIC",
            "themes":[
               "theme3"
            ],
            "isExternal":false,
            "publishedAt":"2019-03-01 12:00:00",
            "opinionCanBeFollowed":true,
            "steps":[
               {
                  "type":"COLLECT",
                  "body":"Le beau body de l'étape CollectStep",
                  "requirements":[

                  ],
                  "statuses":[

                  ],
                  "voteType":"DISABLED",
                  "defaultSort":"RANDOM",
                  "private":false,
                  "proposalForm":"proposalform13",
                  "timeless":false,
                  "isEnabled":true,
                  "title":"Le beau titre de l'étape CollectStep",
                  "label":"CollectStep",
                  "mainView":"GRID",
                  "votesMin":3,
                  "votesLimit":1
               }
            ],
            "districts":[

            ],
            "archived": false
         }
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "maximum-vote-must-be-higher-than-minimum",
        "extensions": {
          "category": "user"
        },
        "@*@": "@*@"
      }
    ],
    "@*@": "@*@"
  }
  """

@database
Scenario: GraphQL client wants to update project with votesMin below 1
  Given I am logged in to graphql as admin
  And feature "votes_min" is enabled
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
        updateAlphaProject(input: $input) {
          project {
            title
            steps {
              ... on ConsultationStep {
                consultations {
                  totalCount
                  edges {
                    node {
                      id
                      title
                    }
                  }
                }
              }
              ... on CollectStep {
                votesMin
                votesLimit
              }
              ... on SelectionStep {
                votesMin
                votesLimit
              }
            }
            archived
          }
        }
      }",
      "variables": {
         "input":{
            "projectId":"UHJvamVjdDpwcm9qZWN0Q29yb25h",
            "restrictedViewerGroups":[

            ],
            "title":"Je suis un projet simple",
            "Cover":"media1",
            "video":"https://www.youtube.com/watch?v=pjJ2w1FX_Wg",
            "authors":[
               "VXNlcjp1c2VyQWRtaW4=",
               "VXNlcjp1c2VyMQ=="
            ],
            "metaDescription":"Je suis la super meta",
            "visibility":"PUBLIC",
            "themes":[
               "theme3"
            ],
            "isExternal":false,
            "publishedAt":"2019-03-01 12:00:00",
            "opinionCanBeFollowed":true,
            "steps":[
               {
                  "type":"COLLECT",
                  "body":"Le beau body de l'étape CollectStep",
                  "requirements":[

                  ],
                  "statuses":[

                  ],
                  "voteType":"DISABLED",
                  "defaultSort":"RANDOM",
                  "private":false,
                  "proposalForm":"proposalform13",
                  "timeless":false,
                  "isEnabled":true,
                  "title":"Le beau titre de l'étape CollectStep",
                  "label":"CollectStep",
                  "mainView":"GRID",
                  "votesMin":0,
                  "votesLimit":1
               }
            ],
            "districts":[

            ],
            "archived": false
         }
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "minimum-vote-must-be-greater-than-or-equal",
        "extensions": {
          "category": "user"
        },
        "@*@": "@*@"
      }
    ],
    "@*@": "@*@"
  }
  """
