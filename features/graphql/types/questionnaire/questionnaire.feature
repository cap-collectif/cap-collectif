@questionnaire
Feature: Questionnaire

Scenario: GraphQL client wants to retrieve questions
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
        ... on Questionnaire {
          questions {
            id
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "questionnaire": {
        "questions": [
          {"id":"UXVlc3Rpb246Mg=="},
          {"id":"UXVlc3Rpb246MTM="},
          {"id":"UXVlc3Rpb246MTQ="},
          {"id":"UXVlc3Rpb246MTU="},
          {"id":"UXVlc3Rpb246MTY="},
          {"id":"UXVlc3Rpb246MTg="},
          {"id":"UXVlc3Rpb246MTk="},
          {"id":"UXVlc3Rpb246MzAx"},
          {"id":"UXVlc3Rpb246MzAy"}
        ]
      }
    }
  }
  """
Scenario: GraphQL client wants to retrieve replies
  Given I am logged in to graphql as admin
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
        ... on Questionnaire {
          viewerReplies {
            id
            responses {
              question {
                id
              }
              ... on ValueResponse {
                value
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
      "questionnaire":{
         "viewerReplies":[
            {
               "id":"reply2",
               "responses":[
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTk="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Il bluffe\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MjA="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Au top\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTg="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Logo 1\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTU="
                     },
                     "value":"Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246Mg=="
                     },
                     "value":"Youpi ! J\u0027adore des JO"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTQ="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTY="
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MzAx"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MzAy"
                     },
                     "value":null
                  }
               ]
            },
            {
               "id":"reply5",
               "responses":[
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTM="
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246Mg=="
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTQ="
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTU="
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTY="
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTg="
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MTk="
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MzAx"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"UXVlc3Rpb246MzAy"
                     },
                     "value":null
                  }
               ]
            }
         ]
      }
   }
}
  """

Scenario: GraphQL client wants to get question's participants with users not confirmed
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        participants {
          totalCount
        }
        questions {
          id
          participants(withNotConfirmedUser: true) {
           totalCount
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
        "questionnaire":{
           "participants":{
              "totalCount":4
           },
           "questions":[
              {
                 "id":"UXVlc3Rpb246Mg==",
                 "participants":{
                    "totalCount":2
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTM=",
                 "participants":{
                    "totalCount":2
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTQ=",
                 "participants":{
                    "totalCount":1
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTU=",
                 "participants":{
                    "totalCount":1
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTY=",
                 "participants":{
                    "totalCount":0
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTg=",
                 "participants":{
                    "totalCount":1
                 }
              },
              {
                 "id":"UXVlc3Rpb246MTk=",
                 "participants":{
                    "totalCount":1
                 }
              },
              {
                 "id":"UXVlc3Rpb246MzAx",
                 "participants":{
                    "totalCount":0
                 }
              },
              {
                 "id":"UXVlc3Rpb246MzAy",
                 "participants":{
                    "totalCount":0
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to get question's participants
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
        ... on Questionnaire {
          participants {
            totalCount
          }
          questions {
            id
            participants {
             totalCount
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
      "questionnaire": {
        "participants": {
          "totalCount": 4
        },
        "questions": [
          {
            "id": @string@,
            "participants": {
              "totalCount": @integer@
            }
          },
          @...@
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to get question's responses
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
            id
            title
            responses {
              totalCount
              edges {
                node {
                  ... on ValueResponse {
                    value
                  }
                }
              }
            }
          }
          ... on SimpleQuestion {
            id
            title
            description
            responses {
              totalCount
              edges {
                node {
                  ... on ValueResponse {
                    value
                  }
                }
              }
            }
          }
          ... on MediaQuestion {
            id
            title
            description
            responses {
              totalCount
              edges {
                node {
                  ... on MediaResponse {
                    medias {
                      id
                      url
                    }
                  }
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
      "questionnaire":{
         "questions":[
            {
               "id":"UXVlc3Rpb246Mg==",
               "title":"\u00cates-vous satisfait que la ville de Paris soit candidate \u00e0 l\u0027organisation des JO de 2024 ?",
               "description":null,
               "responses":{
                  "totalCount":11,
                  "edges":[
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     },
                     {
                        "node":{
                            "value": @string@
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTM=",
               "title":"Pour quel type d\u0027\u00e9preuve \u00eates vous pr\u00eat \u00e0 acheter des places ?",
               "responses":{
                  "totalCount":22,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTQ=",
               "title":"Quel est ton athl\u00e8te favori ?",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTU=",
               "title":"Nelson Monfort parle-t-il:",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTY=",
               "title":"Classez vos choix",
               "responses":{
                  "totalCount":0,
                  "edges":[

                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTg=",
               "title":"Choissez le meilleur logo",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Logo 1\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTk=",
               "title":"Est-ce que Martoni a encore une balle dans son chargeur ?",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Il bluffe\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {

            },
            {

            }
         ]
      }
   }
}
  """

Scenario: GraphQL client wants to get question's responses
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
            id
            title
          responses(withNotConfirmedUser: true) {
              totalCount
              edges {
                node {
                  ... on ValueResponse {
                    value
                  }
                }
              }
            }
          }
          ... on SimpleQuestion {
            id
            title
            description
          responses(withNotConfirmedUser: true) {
              totalCount
              edges {
                node {
                  ... on ValueResponse {
                    value
                  }
                }
              }
            }
          }
          ... on MediaQuestion {
            id
            title
            description
          responses(withNotConfirmedUser: true) {
              totalCount
              edges {
                node {
                  ... on MediaResponse {
                    medias {
                      id
                      url
                    }
                  }
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
      "questionnaire":{
         "questions":[
            {
               "id":"UXVlc3Rpb246Mg==",
               "title":"\u00cates-vous satisfait que la ville de Paris soit candidate \u00e0 l\u0027organisation des JO de 2024 ?",
               "description":null,
               "responses":{
                  "totalCount":12,
                  "edges":[
                     {
                        "node":{
                           "value":"Trop cool ! On va voir Tibo qui cours en slip !"
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":@string@
                        }
                     },
                     {
                        "node":{
                           "value":"Youpi ! J\u0027adore des JO"
                        }
                     },
                     {
                        "node":{
                           "value":"Trop bien ! On va voir de supers athl\u00e8tes \u00e0 Paris !"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTM=",
               "title":"Pour quel type d\u0027\u00e9preuve \u00eates vous pr\u00eat \u00e0 acheter des places ?",
               "responses":{
                  "totalCount":42,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Response of user not confirmed\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTQ=",
               "title":"Quel est ton athl\u00e8te favori ?",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTU=",
               "title":"Nelson Monfort parle-t-il:",
               "responses":{
                  "totalCount":2,
                  "edges":[
                     {
                        "node":{
                           "value":"Pas assez fort (Mon sonotone est en panne)"
                        }
                     },
                     {
                        "node":{
                           "value":"Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTY=",
               "title":"Classez vos choix",
               "responses":{
                  "totalCount":0,
                  "edges":[

                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTg=",
               "title":"Choissez le meilleur logo",
               "responses":{
                  "totalCount":1,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Logo 1\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {
               "id":"UXVlc3Rpb246MTk=",
               "title":"Est-ce que Martoni a encore une balle dans son chargeur ?",
               "responses":{
                  "totalCount":2,
                  "edges":[
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Il bluffe\u0022],\u0022other\u0022:null}"
                        }
                     },
                     {
                        "node":{
                           "value":"{\u0022labels\u0022:[\u0022Oui\u0022],\u0022other\u0022:null}"
                        }
                     }
                  ]
               }
            },
            {

            },
            {

            }
         ]
      }
   }
}
  """
