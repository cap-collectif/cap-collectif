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
            address {
              formatted
            }
          }
        }
      }",
      "variables": {
        "input": {
          "id": "UHJvamVjdDpwcm9qZWN0MQ==",
          "title": "thisisnotatestupdated",
          "authors": ["VXNlcjp1c2VyQWRtaW4=", "VXNlcjp1c2VyMQ==", "VXNlcjp1c2VyMg==", "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI="],
          "projectType": "2",
          "address": "[{\"address_components\" : [{\"long_name\" : \"155\",\"short_name\" : \"155\",\"types\" : [ \"street_number\" ]},{\"long_name\" : \"Boulevard Saint-Germain\",\"short_name\" : \"Boulevard Saint-Germain\",\"types\" : [ \"route\" ]},{\"long_name\" : \"Paris\",\"short_name\" : \"Paris\",\"types\" : [ \"locality\", \"political\" ]},{\"long_name\" : \"Département de Paris\",\"short_name\" : \"Département de Paris\",\"types\" : [ \"administrative_area_level_2\", \"political\" ]},{\"long_name\" : \"Île-de-France\",\"short_name\" : \"IDF\",\"types\" : [ \"administrative_area_level_1\", \"political\" ]},{\"long_name\" : \"France\",\"short_name\" : \"FR\",\"types\" : [ \"country\", \"political\" ]},{\"long_name\" : \"75006\",\"short_name\" : \"75006\",\"types\" : [ \"postal_code\" ]}],\"formatted_address\" : \"155 Boulevard Saint-Germain, 75006 Paris, France\",\"geometry\" : {\"location\" : {\"lat\" : 48.8538407,\"lng\" : 2.3321014},\"location_type\" : \"ROOFTOP\",\"viewport\" : {\"northeast\" : {\"lat\" : 48.8551896802915,\"lng\" : 2.333450380291502},\"southwest\" : {\"lat\" : 48.8524917197085,\"lng\" : 2.330752419708498}}},\"place_id\" : \"ChIJq9_ddtdx5kcRRoIJStYdLlA\",\"plus_code\" : {\"compound_code\" : \"V83J+GR Paris, France\",\"global_code\" : \"8FW4V83J+GR\"},\"types\" : [ \"street_address\" ]}]"
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
                 {
                    "id":"VXNlcjp1c2VyMQ==",
                    "username":"lbrunet",
                    "email":"lbrunet@cap-collectif.com",
                    "createdAt":"2015-01-01 00:00:00"
                 },
                 {
                    "id":"VXNlcjp1c2VyMg==",
                    "username":"sfavot",
                    "email":"sfavot@cap-collectif.com",
                    "createdAt":"2015-01-02 00:00:00"
                 },
                 {
                    "id":"VXNlcjp1c2VyQWRtaW4=",
                    "username":"admin",
                    "email":"admin@test.com",
                    "createdAt":"2015-01-04 00:00:00"
                 },
                 {
                    "id":"T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=",
                    "username":"GIEC",
                    "email":"ipcc-sec@wmo.int",
                    "createdAt":"@string@.isDateTime()"
                 }
              ],
              "address":{
                 "formatted":"155 Boulevard Saint-Germain, 75006 Paris, France"
              }
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
          "cover": "media1",
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
            "cover":"media1",
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
            "cover":"media1",
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

@database
Scenario: GraphQL client wants to update step with another questionnaire
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
    {
      "query": "mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
        updateAlphaProject(input: $input) {
          project {
            steps {
              ...on QuestionnaireStep {
                title
                questionnaire {
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
            "projectId": "UHJvamVjdDpwcm9qZWN0OA==",
            "title": "Projet avec questionnaire",
            "authors": [
              "VXNlcjp1c2VyV2VsY29tYXR0aWM="
            ],
            "projectType": "7",
            "cover": null,
            "video": null,
            "themes": [
              "theme3"
            ],
            "districts": [],
            "metaDescription": null,
            "isExternal": false,
            "publishedAt": "2014-12-24 00:00:00",
            "visibility": "PUBLIC",
            "opinionCanBeFollowed": false,
            "steps": [
              {
                "id": "pstep2",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "title": "Présentation",
                "startAt": null,
                "endAt": null,
                "label": "Présentation",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "type": "PRESENTATION"
              },
              {
                "id": "questionnairestep1",
                "label": "Questionnaire",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "title": "Questionnaire des JO 2024",
                "endAt": "2024-09-27 00:00:00",
                "startAt": "2014-09-27 00:00:00",
                "isEnabled": true,
                "timeless": false,
                "isAnonymousParticipationAllowed": false,
                "metaDescription": null,
                "customCode": null,
                "requirementsReason": null,
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlT3duZXJXaXRob3V0U3RlcA==",
                "footer": null,
                "collectParticipantsEmail": false,
                "footerUsingJoditWysiwyg": false,
                "requirements": [],
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnairestep2",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Questionnaire",
                "startAt": "2014-09-27 00:00:00",
                "endAt": "2024-09-27 00:00:00",
                "label": "Questionnaire",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnairestepJump",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Etape de questionnaire avec questionnaire sauts conditionnels",
                "startAt": "2014-09-27 00:00:00",
                "endAt": "2024-09-27 00:00:00",
                "label": "Questionnaire conditionnel",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBz",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnairestepJump2",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Essais de sauts conditionnels",
                "startAt": "2014-09-27 00:00:00",
                "endAt": "2024-09-27 00:00:00",
                "label": "Questionnaire conditionnel",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBzMg==",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnairestep3",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Etape de questionnaire fermée",
                "startAt": "2014-09-27 00:00:00",
                "endAt": "2016-09-27 00:00:00",
                "label": "Questionnaire",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMw==",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnaireStepLotChoices",
                "body": "Une étape avec un questionnaire avec beaucoup de choix",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Questionnaire avec beaucoup de choix",
                "startAt": "2020-01-01 00:00:00",
                "endAt": "2028-09-27 00:00:00",
                "label": "Questionnaire choix",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlTG90Q2hvaWNlcw==",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              },
              {
                "id": "questionnairestep6",
                "body": "Insert Long Text here",
                "bodyUsingJoditWysiwyg": false,
                "timeless": false,
                "title": "Questionnaire avec des conditions requises",
                "startAt": "2014-09-27 00:00:00",
                "endAt": "2024-09-27 00:00:00",
                "label": "Faut répondre au questionnaire pour avoir un bonbon",
                "customCode": null,
                "metaDescription": null,
                "isEnabled": true,
                "requirements": [
                  {
                    "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQxOA==",
                    "type": "FIRSTNAME"
                  },
                  {
                    "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQxOQ==",
                    "type": "LASTNAME"
                  },
                  {
                    "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQyMA==",
                    "type": "POSTAL_ADDRESS"
                  },
                  {
                    "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQyMQ==",
                    "type": "IDENTIFICATION_CODE"
                  }
                ],
                "questionnaire": "UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw==",
                "footer": null,
                "footerUsingJoditWysiwyg": false,
                "isAnonymousParticipationAllowed": false,
                "collectParticipantsEmail": false,
                "requirementsReason": null,
                "type": "QUESTIONNAIRE"
              }
            ],
            "locale": null,
            "archived": false
         }
      }
    }
  """
  Then the JSON response should match:
  """
   {
    "data": {
      "updateAlphaProject": {
        "project": {
          "steps": [
            {},
            {
              "title": "Questionnaire des JO 2024",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlT3duZXJXaXRob3V0U3RlcA==",
                "title": "Questionnaire visible par un owner sans step"
              }
            },
            {
              "title": "Questionnaire",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==",
                "title": "Questionnaire de test"
              }
            },
            {
              "title": "Etape de questionnaire avec questionnaire sauts conditionnels",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBz",
                "title": "El famoso questionnaire a branche"
              }
            },
            {
              "title": "Essais de sauts conditionnels",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBzMg==",
                "title": "Questionnaire saut conditionnel (tous les champs)"
              }
            },
            {
              "title": "Etape de questionnaire fermée",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMw==",
                "title": "Questionnaire dans une étape fermée"
              }
            },
            {
              "title": "Questionnaire avec beaucoup de choix",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlTG90Q2hvaWNlcw==",
                "title": "Que choisir?"
              }
            },
            {
              "title": "Questionnaire avec des conditions requises",
              "questionnaire": {
                "id": "UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw==",
                "title": "Votre condition requise favorite"
              }
            }
          ]
        }
      }
    }
   }
  """
