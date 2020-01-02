@opinions
Feature: Opinion

Scenario: Get contributions ordered by votes desc but with one pinned
  When I send a GraphQL request:
  """
  {
    section: node(id: "opinionType6") {
      ... on Section {
        contributionConnection(orderBy: {field: VOTE_COUNT, direction: DESC}, first: 20){
          totalCount
          edges {
            node {
              ... on Opinion {
                id
                publishedAt
                pinned
                title
                position
                arguments{
                  totalCount
                }
                votes {
                  totalCount
                }
                author{
                  id
                }
              }
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
   "data":{
      "section":{
         "contributionConnection":{
            "totalCount":58,
            "edges":[
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uNjE=",
                     "publishedAt":"2018-03-01 12:00:00",
                     "pinned":true,
                     "title":"Li\u00e9 \u00e0 article et \u00e9pingl\u00e9",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyMg=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uNjk=",
                     "publishedAt":"2018-04-01 01:09:00",
                     "pinned":false,
                     "title":"Opinion d hier 69",
                     "position":1,
                     "arguments":{
                        "totalCount":38
                     },
                     "votes":{
                        "totalCount":29
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTc2",
                     "publishedAt":"2019-04-01 02:56:00",
                     "pinned":false,
                     "title":"Opinion d hier 176",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTc3",
                     "publishedAt":"2019-04-01 02:57:00",
                     "pinned":false,
                     "title":"Opinion d hier 177",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTc4",
                     "publishedAt":"2019-04-01 02:58:00",
                     "pinned":false,
                     "title":"Opinion d hier 178",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTc5",
                     "publishedAt":"2019-04-01 02:59:00",
                     "pinned":false,
                     "title":"Opinion d hier 179",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTgw",
                     "publishedAt":"2019-04-01 03:00:00",
                     "pinned":false,
                     "title":"Opinion d hier 180",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTgx",
                     "publishedAt":"2019-04-01 03:01:00",
                     "pinned":false,
                     "title":"Opinion d hier 181",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTgy",
                     "publishedAt":"2019-04-01 03:02:00",
                     "pinned":false,
                     "title":"Opinion d hier 182",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTgz",
                     "publishedAt":"2019-04-01 03:03:00",
                     "pinned":false,
                     "title":"Opinion d hier 183",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg0",
                     "publishedAt":"2019-04-01 03:04:00",
                     "pinned":false,
                     "title":"Opinion d hier 184",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg1",
                     "publishedAt":"2019-04-01 03:05:00",
                     "pinned":false,
                     "title":"Opinion d hier 185",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg2",
                     "publishedAt":"2019-04-01 03:06:00",
                     "pinned":false,
                     "title":"Opinion d hier 186",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg3",
                     "publishedAt":"2019-04-01 03:07:00",
                     "pinned":false,
                     "title":"Opinion d hier 187",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg4",
                     "publishedAt":"2019-04-01 03:08:00",
                     "pinned":false,
                     "title":"Opinion d hier 188",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTg5",
                     "publishedAt":"2019-04-01 03:09:00",
                     "pinned":false,
                     "title":"Opinion d hier 189",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTkw",
                     "publishedAt":"2019-04-01 03:10:00",
                     "pinned":false,
                     "title":"Opinion d hier 190",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTkx",
                     "publishedAt":"2019-04-01 03:11:00",
                     "pinned":false,
                     "title":"Opinion d hier 191",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTky",
                     "publishedAt":"2019-04-01 03:12:00",
                     "pinned":false,
                     "title":"Opinion d hier 192",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"T3BpbmlvbjpvcGluaW9uMTkz",
                     "publishedAt":"2019-04-01 03:13:00",
                     "pinned":false,
                     "title":"Opinion d hier 193",
                     "position":1,
                     "arguments":{
                        "totalCount":0
                     },
                     "votes":{
                        "totalCount":0
                     },
                     "author":{
                        "id":"VXNlcjp1c2VyNQ=="
                     }
                  }
               }
            ]
         }
      }
   }
}
  """

Scenario: Get contributions ordered by votes desc
  When I send a GraphQL request:
  """
  {
    section: node(id: "opinionType5") {
      ... on Section {
        contributionConnection(first: 3, orderBy: {field: VOTE_COUNT, direction: DESC}){
          totalCount
          edges {
            node {
              ... on Opinion {
                id
                publishedAt
                pinned
                title
              	position
                arguments{
                  totalCount
                }
                votes {
                  totalCount
                }
                author{
                  id
                }
              }
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "section": {
        "contributionConnection": {
          "totalCount": 3,
          "edges": [
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTk=",
                "publishedAt": "2018-03-01 10:00:00",
                "pinned": false,
                "title": "Article 2",
                "position": 2,
                "arguments": {
                  "totalCount": 0
                },
                "votes": {
                  "totalCount": 46
                },
                "author": {
                  "id": "VXNlcjp1c2VyMg=="
                }
              }
            },
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTc=",
                "publishedAt": "2018-03-01 07:00:00",
                "pinned": false,
                "title": "Article 1",
                "position": 1,
                "arguments": {
                  "totalCount": 4
                },
                "votes": {
                  "totalCount": 4
                },
                "author": {
                  "id": "VXNlcjp1c2VyMg=="
                }
              }
            },
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTg=",
                "publishedAt": "2018-03-01 08:00:00",
                "pinned": false,
                "title": "Article 3",
                "position": 3,
                "arguments": {
                  "totalCount": 0
                },
                "votes": {
                  "totalCount": 0
                },
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

Scenario: Get contributions ordered by position desc
  When I send a GraphQL request:
  """
  {
    section: node(id: "opinionType5") {
      ... on Section {
        contributionConnection(orderBy: {field: POSITION, direction: DESC}){
          totalCount
          edges {
            node {
              ... on Opinion {
                id
                publishedAt
                pinned
                title
              	position
                arguments{
                  totalCount
                }
                votes {
                  totalCount
                }
                author{
                  id
                }
              }
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "section": {
        "contributionConnection": {
          "totalCount": 3,
          "edges": [
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTg=",
                "publishedAt": "2018-03-01 08:00:00",
                "pinned": false,
                "title": "Article 3",
                "position": 3,
                "arguments": {
                  "totalCount": 0
                },
                "votes": {
                  "totalCount": 0
                },
                "author": {
                  "id": "VXNlcjp1c2VyNQ=="
                }
              }
            },
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTk=",
                "publishedAt": "2018-03-01 10:00:00",
                "pinned": false,
                "title": "Article 2",
                "position": 2,
                "arguments": {
                  "totalCount": 0
                },
                "votes": {
                  "totalCount": 46
                },
                "author": {
                  "id": "VXNlcjp1c2VyMg=="
                }
              }
            },
            {
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNTc=",
                "publishedAt": "2018-03-01 07:00:00",
                "pinned": false,
                "title": "Article 1",
                "position": 1,
                "arguments": {
                  "totalCount": 4
                },
                "votes": {
                  "totalCount": 4
                },
                "author": {
                  "id": "VXNlcjp1c2VyMg=="
                }
              }
            }
          ]
        }
      }
    }
  }
  """
