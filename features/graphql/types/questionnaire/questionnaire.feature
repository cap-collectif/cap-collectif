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
          {"id":"2"},
          {"id":"13"},
          {"id":"14"},
          {"id":"15"},
          {"id":"16"},
          {"id":"18"},
          {"id":"19"},
          {"id":"301"},
          {"id":"302"}
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
                        "id":"2"
                     },
                     "value":"Youpi ! J\u0027adore des JO"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"14"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"15"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"16"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"18"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"19"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"301"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"302"
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
                        "id":"13"
                     },
                     "value":"{\u0022labels\u0022:[\u0022Natation\u0022],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"2"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"14"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"15"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"16"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"18"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"19"
                     },
                     "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
                  },
                  {
                     "question":{
                        "id":"301"
                     },
                     "value":null
                  },
                  {
                     "question":{
                        "id":"302"
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

Scenario: GraphQL client wants to get question's participants
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNA==") {
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
          "totalCount": @integer@
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
               "id":"2",
               "title":"\u00cates-vous satisfait que la ville de Paris soit candidate \u00e0 l\u0027organisation des JO de 2024 ?",
               "description":null,
               "responses":{
                  "totalCount":10,
                  "edges":[
                     {
                        "node":{
                           "value":"Trop bien ! On va voir de supers athl\u00e8tes \u00e0 Paris !"
                        }
                     },
                     {
                        "node":{
                           "value":"Youpi ! J\u0027adore des JO"
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
               "id":"13",
               "title":"Pour quel type d\u0027\u00e9preuve \u00eates vous pr\u00eat \u00e0 acheter des places ?",
               "responses":{
                  "totalCount":20,
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
               "id":"14",
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
               "id":"15",
               "title":"Nelson Monfort parle-t-il:",
               "responses":{
                  "totalCount":0,
                  "edges":[

                  ]
               }
            },
            {
               "id":"16",
               "title":"Classez vos choix",
               "responses":{
                  "totalCount":0,
                  "edges":[

                  ]
               }
            },
            {
               "id":"18",
               "title":"Choissez le meilleur logo",
               "responses":{
                  "totalCount":0,
                  "edges":[

                  ]
               }
            },
            {
               "id":"19",
               "title":"Est-ce que Martoni a encore une balle dans son chargeur ?",
               "responses":{
                  "totalCount":0,
                  "edges":[

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
