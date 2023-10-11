@delete_account @delete
Feature: Delete user contributions

@database @rabbitmq @harddelete
Scenario: User5 who decides to hard delete his account should have his content anonymised (closed step).
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
          proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
            totalCount
            edges {
              node {
                id
                title
                body
                createdAt
                published
                author {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "proposals": {
          "totalCount": 2,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMg==",
                "title": "Proposition plus votable",
                "body": "TODO",
                "createdAt": "2017-02-01 09:40:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMw==",
                "title": "Proposition plus votable 2",
                "body": "TODO",
                "createdAt": "2017-02-01 09:50:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            }
          ]
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "HARD",
        "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
          proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
            totalCount
            edges {
              node {
                id
                title
                body
                createdAt
                published
                author {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "proposals": {
          "totalCount": 2,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMg==",
                "title": "deleted-title",
                "body": "deleted-content-by-author",
                "createdAt": "2017-02-01 09:40:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMw==",
                "title": "deleted-title",
                "body": "deleted-content-by-author",
                "createdAt": "2017-02-01 09:50:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            }
          ]
        }
      }
    }
  }
  """

@database @rabbitmq @harddelete
Scenario: User who decides to hard delete his account should have his content deleted in open projects.
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
            proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
              totalCount
              edges {
                node {
                   id
                   createdAt
                   published
                   author {
                      id
                   }

                }
              }
            }
         }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "proposals": {
          "totalCount": 8,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDg=",
                "createdAt": "2017-02-01 00:03:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNTIy"
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "createdAt": "2017-02-01 00:03:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
                "createdAt": "2017-02-01 00:04:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyV2VsY29tYXR0aWM="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWw0",
                "createdAt": "2017-02-01 00:04:19",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNw=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMA==",
                "createdAt": "2017-02-01 00:07:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMQ==",
                "createdAt": "2017-02-01 00:08:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "createdAt": "2017-02-01 09:08:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyV2VsY29tYXR0aWM="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDQ=",
                "createdAt": "2018-04-02 00:00:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            }
          ]
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "HARD",
        "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
            proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
              totalCount
              edges {
                node {
                   id
                   createdAt
                   published
                   author {
                      id
                   }

                }
              }
            }
         }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx"
    }
  }
  """
  # One proposal has been removed but needs to reindex to change totalCount
  Then the JSON response should match:
  """
  {
     "data":{
        "step":{
           "proposals":{
              "totalCount":8,
              "edges":[
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwxMDg=",
                       "createdAt":"2017-02-01 00:03:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyNTIy"
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwy",
                       "createdAt":"2017-02-01 00:03:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyNQ=="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwz",
                       "createdAt":"2017-02-01 00:04:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyV2VsY29tYXR0aWM="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWw0",
                       "createdAt":"2017-02-01 00:04:19",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyNw=="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwxMA==",
                       "createdAt":"2017-02-01 00:07:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyQWRtaW4="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwxMQ==",
                       "createdAt":"2017-02-01 00:08:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyQWRtaW4="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwx",
                       "createdAt":"2017-02-01 09:08:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyV2VsY29tYXR0aWM="
                       }
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cHJvcG9zYWwxMDQ=",
                       "createdAt":"2018-04-02 00:00:00",
                       "published":true,
                       "author":{
                          "id":"VXNlcjp1c2VyQWRtaW4="
                       }
                    }
                 }
              ]
           }
        }
     }
  }
  """

@database @rabbitmq @softdelete
Scenario: User5 who decides to soft delete his account should have his content kept readable (closed step).
  Given I am logged in to graphql as super admin
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "SOFT",
        "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
          proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
            totalCount
            edges {
              node {
                id
                title
                body
                createdAt
                published
                author {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "proposals": {
          "totalCount": 2,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMg==",
                "title": "Proposition plus votable",
                "body": "TODO",
                "createdAt": "2017-02-01 09:40:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMw==",
                "title": "Proposition plus votable 2",
                "body": "TODO",
                "createdAt": "2017-02-01 09:50:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            }
          ]
        }
      }
    }
  }
  """

@database @rabbitmq @softdelete
Scenario: User who decides to soft delete his account should not have his content kept in open projects.
  Given I am logged in to graphql as super admin
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "SOFT",
        "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
          proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
            totalCount
            edges {
              node {
                id
                title
                body
                createdAt
                published
                author {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "step": {
        "proposals": {
          "totalCount": 8,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDg=",
                "title": "Renovation of the gymnasium",
                "body": "<p>We will do a grat gymnasium, i swear !</p>",
                "createdAt": "2017-02-01 00:03:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNTIy"
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "title": "Rénovation du gymnase",
                "body": "<p>On va en faire un beau gymnase, promis :)</p>",
                "createdAt": "2017-02-01 00:03:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
                "title": "Installation de bancs sur la place de la mairie",
                "body": "Insert Long Text here",
                "createdAt": "2017-02-01 00:04:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyV2VsY29tYXR0aWM="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWw0",
                "title": "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
                "body": "Insert Long Text here",
                "createdAt": "2017-02-01 00:04:19",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyNw=="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMA==",
                "title": "Proposition pas encore votable",
                "body": "<p>TODO</p>",
                "createdAt": "2017-02-01 00:07:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMQ==",
                "title": "Proposition plus votable",
                "body": "TODO",
                "createdAt": "2017-02-01 00:08:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "title": "Ravalement de la façade de la bibliothèque municipale",
                "body": "Insert Long Text here",
                "createdAt": "2017-02-01 09:08:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyV2VsY29tYXR0aWM="
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDQ=",
                "title": "Test de publication avec accusé de réception",
                "body": "TODO",
                "createdAt": "2018-04-02 00:00:00",
                "published": true,
                "author": {
                  "id": "VXNlcjp1c2VyQWRtaW4="
                }
              }
            }
          ]
        }
      }
    }
  }
  """