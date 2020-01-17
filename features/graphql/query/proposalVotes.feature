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
                published
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
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $before: String, $after: String) {
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
                votes(first: $count, before: $before, after: $after) {
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
                    "startCursor": "YToxOntpOjA7aToxNDI1MTY0NDAxMDAwO30=",
                    "hasNextPage": false,
                    "endCursor": "YToxOntpOjA7aToxNDI1MTY0NDAxMDAwO30="
                  },
                  "totalCount": 1,
                  "edges": [
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
                    "startCursor": "YToxOntpOjA7aToxNDg1OTA2NjAwMDAwO30=",
                    "hasNextPage": false,
                    "endCursor": "YToxOntpOjA7aToxNDg1OTA2MzYwMDAwO30="
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
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $before: String, $after: String) {
      node(id: $id) {
        ... on Proposal {
          id
          votes(first: $count, orderBy: {field: PUBLISHED_AT, direction: DESC}, before: $before, after: $after) {
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
      "after": "YToxOntpOjA7aToxNDg1OTA2MzYwMDAwO30="
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
            "startCursor": "YToxOntpOjA7aToxNDg1OTA2MzAwMDAwO30=",
            "hasNextPage": false,
            "endCursor": "YToxOntpOjA7aToxNDg1OTA2MDYwMDAwO30="
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
    "query": "query ProposalStepProposalsQuery($id: ID!, $count: Int!, $before: String, $after: String) {
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
                votes(first: $count, before: $before, after: $after) {
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
                    "startCursor": "YToxOntpOjA7aToxNDI1MTY0NDAxMDAwO30=",
                    "hasNextPage": false,
                    "endCursor": "YToxOntpOjA7aToxNDI1MTY0NDAxMDAwO30="
                  },
                  "totalCount": 1,
                  "edges": [
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
                    "startCursor": "YToxOntpOjA7aToxNDg1OTA2NjAwMDAwO30=",
                    "hasNextPage": false,
                    "endCursor": "YToxOntpOjA7aToxNDg1OTA1NzYwMDAwO30="
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
