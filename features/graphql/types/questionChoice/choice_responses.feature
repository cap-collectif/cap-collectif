@question_choice
Feature: Question choice

Scenario: GraphQL client wants question's choices and the number of answers to each of them
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==") {
      ... on Questionnaire {
        questions {
          type
          ... on MultipleChoiceQuestion {
            otherResponses {
              totalCount
            }
            choices(allowRandomize: false) {
              title
              responses {
                totalCount
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
               "type":"text"
            },
            {
               "type":"checkbox",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Athl\u00e9tisme",
                     "responses":{
                        "totalCount":10
                     }
                  },
                  {
                     "title":"Natation",
                     "responses":{
                        "totalCount":10
                     }
                  },
                  {
                     "title":"Sports collectifs",
                     "responses":{
                        "totalCount":20
                     }
                  },
                  {
                     "title":"Sports individuels",
                     "responses":{
                        "totalCount":0
                     }
                  }
               ]
            },
            {
               "type":"radio",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Maxime Arrouard",
                     "responses":{
                        "totalCount":1
                     }
                  },
                  {
                     "title":"Superman",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Cyril Lage",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Spylou Super Sayen",
                     "responses":{
                        "totalCount":0
                     }
                  }
               ]
            },
            {
               "type":"select",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Trop fort (Mon sonotone est tout neuf)",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)",
                     "responses":{
                        "totalCount":1
                     }
                  },
                  {
                     "title":"Pas assez fort (Mon sonotone est en panne)",
                     "responses":{
                        "totalCount":0
                     }
                  }
               ]
            },
            {
               "type":"ranking",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Choix 1",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Choix 2",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Choix 3 avec un titre tr\u00e8s long pour le test du rendu",
                     "responses":{
                        "totalCount":0
                     }
                  }
               ]
            },
            {
               "type":"radio",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Logo 1",
                     "responses":{
                        "totalCount":1
                     }
                  },
                  {
                     "title":"Logo 2",
                     "responses":{
                        "totalCount":0
                     }
                  }
               ]
            },
            {
               "type":"button",
               "otherResponses":{
                  "totalCount":0
               },
               "choices":[
                  {
                     "title":"Oui",
                     "responses":{
                        "totalCount":0
                     }
                  },
                  {
                     "title":"Il bluffe",
                     "responses":{
                        "totalCount":1
                     }
                  }
               ]
            },
            {
               "type":"section"
            },
            {
               "type":"section"
            }
         ]
      }
   }
}
  """
