@question_choice
Feature: Question choice

Scenario: GraphQL client wants question's choices and the number of answers to each of them
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNA==") {
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
                 "type":"textarea"
              },
              {
                 "type":"button",
                 "otherResponses":{
                    "totalCount":1
                 },
                 "choices":[
                    {
                       "title":"Au top",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"Du pur bullshit",
                       "responses":{
                          "totalCount":0
                       }
                    }
                 ]
              },
              {
                 "type":"checkbox",
                 "otherResponses":{
                    "totalCount":0
                 },
                 "choices":[
                    {
                       "title":"Incoh\u00e9rente",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"C\u0027est de la diffamation !",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"Que de la publicit\u00e9 (mensong\u00e8re en plus !)",
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
                       "title":"Je dis oui",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"Je dis non",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"J\u0027ai rien compris",
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
                       "title":"Compr\u00e9hensible",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"R\u00e9alisable",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"Importante",
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
                       "title":"React",
                       "responses":{
                          "totalCount":0
                       }
                    },
                    {
                       "title":"Vue",
                       "responses":{
                          "totalCount":0
                       }
                    }
                 ]
              }
           ]
        }
     }
  }
  """
