@proposals @proposalVotes
Feature: proposal votes connection

@database @read-only
Scenario: User wants to see unpublished votes on proposals
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $first: Int, $stepId: ID!, $includeUnpublished: Boolean){
      proposal: node(id: $proposalId) {
        ... on Proposal {
          votes(first: $first, stepId: $stepId, includeUnpublished: $includeUnpublished ) {
            edges {
              node {
                id
                ...on ProposalUserVote {
                  published
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxNw==",
      "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
      "first": 50,
      "includeUnpublished": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "proposal":{
           "votes":{
              "edges":[
               {
                  "node": {
                    "id": "1055",
                    "published": true
                  }
               },
               {
                 "node": {
                   "id": "1054",
                   "published": true
                 }
               },
               {
                 "node": {
                   "id": "1053",
                   "published": true
                 }
               },
               {
                 "node": {
                   "id": "1056",
                   "published": false
                 }
               }
              ]
           }
        }
     }
  }
  """

@database @read-only
Scenario: User wants to paginate votes on proposals
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $after: String) {
      node(id: $id) {
        ... on ProposalStep {
          id
          proposals{
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                votes(first: $count, after: $after) {
                  pageInfo {
                    startCursor
                    hasNextPage
                    endCursor
                  }
                  totalCount
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
      "count": 5
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "node": {
        "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposals": {
          "totalCount": 3,
          "pageInfo": {
            "hasNextPage": false,
            "endCursor": "YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ=="
          },
          "edges": [
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "votes": {
                  "pageInfo": {
                    "startCursor": null,
                    "hasNextPage": false,
                    "endCursor": null
                  },
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "votes": {
                  "pageInfo": {
                    "startCursor": "YToyOntpOjA7aToxNzA0MDYzNjAwMDAwO2k6MTtzOjQ6IjEwNjYiO30=",
                    "hasNextPage": false,
                    "endCursor": "YToyOntpOjA7aToxNDI1MTY0NDAxMDAwO2k6MTtzOjQ6IjEwMDAiO30="
                  },
                  "totalCount": 2,
                  "edges": [
                    {
                      "node": {
                        "id": "1066"
                      }
                    },
                    {
                      "node": {
                        "id": "1000"
                      }
                    }
                  ]
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
                "votes": {
                  "pageInfo": {
                    "startCursor": "YToyOntpOjA7aToxNDg1OTA2NjAwMDAwO2k6MTtzOjQ6IjEwNDciO30=",
                    "hasNextPage": true,
                    "endCursor": "YToyOntpOjA7aToxNDg1OTA2MzYwMDAwO2k6MTtzOjQ6IjEwNDMiO30="
                  },
                  "totalCount": 47,
                  "edges": [
                    {
                      "node": {
                        "id": "1047"
                      }
                    },
                    {
                      "node": {
                        "id": "1046"
                      }
                    },
                    {
                      "node": {
                        "id": "1045"
                      }
                    },
                    {
                      "node": {
                        "id": "1044"
                      }
                    },
                    {
                      "node": {
                        "id": "1043"
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  }
  """

@database @read-only
Scenario: User wants to paginate votes on proposals with after cursor
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $after: String) {
      node(id: $id) {
        ... on Proposal {
          id
          votes(first: $count, orderBy: {field: PUBLISHED_AT, direction: DESC}, after: $after) {
            pageInfo {
              startCursor
              hasNextPage
              endCursor
            }
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
      "count": 5,
      "after": "YToyOntpOjA7aToxNDg1OTA2MzYwMDAwO2k6MTtzOjQ6IjEwNDMiO30="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "node": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
        "votes": {
          "pageInfo": {
            "startCursor": "YToyOntpOjA7aToxNDg1OTA2MzAwMDAwO2k6MTtzOjQ6IjEwNDIiO30=",
            "hasNextPage": true,
            "endCursor": "YToyOntpOjA7aToxNDg1OTA2MDYwMDAwO2k6MTtzOjQ6IjEwMzgiO30="
          },
          "totalCount": 47,
          "edges": [
            {
              "node": {
                "id": "1042"
              }
            },
            {
              "node": {
                "id": "1041"
              }
            },
            {
              "node": {
                "id": "1040"
              }
            },
            {
              "node": {
                "id": "1039"
              }
            },
            {
              "node": {
                "id": "1038"
              }
            }
          ]
        }
      }
    }
  }
  """

@database @read-only
Scenario: User wants to paginate votes on proposals with more votes than 10
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $after: String) {
      node(id: $id) {
        ... on ProposalStep {
          id
          proposals{
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                votes(first: $count, after: $after) {
                  pageInfo {
                    startCursor
                    hasNextPage
                    endCursor
                  }
                  totalCount
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
      "count": 15
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "node": {
        "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposals": {
          "totalCount": 3,
          "pageInfo": {
            "hasNextPage": false,
            "endCursor": "YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ=="
          },
          "edges": [
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "votes": {
                  "pageInfo": {
                    "startCursor": null,
                    "hasNextPage": false,
                    "endCursor": null
                  },
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "votes": {
                  "pageInfo": {
                    "startCursor": "YToyOntpOjA7aToxNzA0MDYzNjAwMDAwO2k6MTtzOjQ6IjEwNjYiO30=",
                    "hasNextPage": false,
                    "endCursor": "YToyOntpOjA7aToxNDI1MTY0NDAxMDAwO2k6MTtzOjQ6IjEwMDAiO30="
                  },
                  "totalCount": 2,
                  "edges": [
                    {
                      "node": {
                        "id": "1066"
                      }
                    },
                    {
                      "node": {
                        "id": "1000"
                      }
                    }
                  ]
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
                "votes": {
                  "pageInfo": {
                    "startCursor": "YToyOntpOjA7aToxNDg1OTA2NjAwMDAwO2k6MTtzOjQ6IjEwNDciO30=",
                    "hasNextPage": true,
                    "endCursor": "YToyOntpOjA7aToxNDg1OTA1NzYwMDAwO2k6MTtzOjQ6IjEwMzMiO30="
                  },
                  "totalCount": 47,
                  "edges": [
                    {
                      "node": {
                        "id": "1047"
                      }
                    },
                    {
                      "node": {
                        "id": "1046"
                      }
                    },
                    {
                      "node": {
                        "id": "1045"
                      }
                    },
                    {
                      "node": {
                        "id": "1044"
                      }
                    },
                    {
                      "node": {
                        "id": "1043"
                      }
                    },
                    {
                      "node": {
                        "id": "1042"
                      }
                    },
                    {
                      "node": {
                        "id": "1041"
                      }
                    },
                    {
                      "node": {
                        "id": "1040"
                      }
                    },
                    {
                      "node": {
                        "id": "1039"
                      }
                    },
                    {
                      "node": {
                        "id": "1038"
                      }
                    },
                    {
                      "node": {
                        "id": "1037"
                      }
                    },
                    {
                      "node": {
                        "id": "1036"
                      }
                    },
                    {
                      "node": {
                        "id": "1035"
                      }
                    },
                    {
                      "node": {
                        "id": "1034"
                      }
                    },
                    {
                      "node": {
                        "id": "1033"
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: User wants to see votes on collect and selection steps simultaneously
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ProposalStepProposalsQuery($collectId: ID!, $selectionId: ID!, $count: Int!) {
      node(id: $collectId) {
        ... on ProposalStep {
          id
          proposals {
            edges {
              cursor
              node {
                id
                allVotes: votes(first: $count) {
                  totalCount
                  edges {
                    node {
                      id
                      ...on ProposalUserVote {
                        published
                      }
                      step {
                        title
                        __typename
                      }
                    }
                  }
                }
                votesOnCollect: votes(first: $count, stepId: $collectId) {
                  totalCount
                  edges {
                    node {
                      id
                      ...on ProposalUserVote {
                        published
                      }
                      step {
                        title
                        __typename
                      }
                    }
                  }
                }
                votesOnSelection: votes(first: $count, stepId: $selectionId) {
                  totalCount
                  edges {
                    node {
                      id
                      ...on ProposalUserVote {
                        published
                      }
                      step {
                        title
                        __typename
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "collectId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx",
      "selectionId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "node": {
        "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx",
        "proposals": {
          "edges": [
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "allVotes": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwOCI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDg=",
                "allVotes": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "allVotes": {
                  "totalCount": 2,
                  "edges": [
                    {
                      "node": {
                        "id": "1066",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1000",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    }
                  ]
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 2,
                  "edges": [
                    {
                      "node": {
                        "id": "1066",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1000",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    }
                  ]
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwz",
                "allVotes": {
                  "totalCount": 47,
                  "edges": [
                    {
                      "node": {
                        "id": "1047",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1046",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1045",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    }
                  ]
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 47,
                  "edges": [
                    {
                      "node": {
                        "id": "1047",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1046",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    },
                    {
                      "node": {
                        "id": "1045",
                        "published": true,
                        "step": {
                          "title": "Sélection",
                          "__typename": "SelectionStep"
                        }
                      }
                    }
                  ]
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTAzODU5MDAwO2k6MTtzOjk6InByb3Bvc2FsNCI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWw0",
                "allVotes": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTA0MDIwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDEwIjt9",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMA==",
                "allVotes": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNDg1OTA0MDgwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDExIjt9",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMQ==",
                "allVotes": {
                  "totalCount": 1,
                  "edges": [
                    {
                      "node": {
                        "id": "1052",
                        "published": true,
                        "step": {
                          "title": "Fermée",
                          "__typename": "SelectionStep"
                        }
                      }
                    }
                  ]
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "cursor": "YToyOntpOjA7aToxNTIzMzk3NjAwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwNCI7fQ==",
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwxMDQ=",
                "allVotes": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnCollect": {
                  "totalCount": 0,
                  "edges": []
                },
                "votesOnSelection": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            }
          ]
        }
      }
    }
  }
  """
