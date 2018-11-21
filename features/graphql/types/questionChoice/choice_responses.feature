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
            choices {
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
          {"type": "text"},
          {"type": "textarea"},
          {
            "type": "button",
            "otherResponses": {"totalCount": 1},
            "choices": [
              {
                "title": "Au top",
                "responses": {
                  "totalCount": 0
                }
              },
              {
                "title": "Du pur bullshit",
                "responses": {
                  "totalCount": 0
                }
              }
            ]
          },
          {
            "type": "checkbox",
            "otherResponses": {"totalCount": 0},
            "choices": [
              {
                "title": @string@,
                "responses": {
                  "totalCount": 2
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": 1
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": 2
                }
              }
            ]
          },
          {
            "type":"radio",
            "otherResponses": {"totalCount": 0},
            "choices": [
              {
                "title": "Je dis oui",
                "responses": {
                  "totalCount": 1
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": @integer@
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": @integer@
                }
              }
            ]
          },
          {
            "type": "ranking",
            "otherResponses": {"totalCount": 0},
            "choices": [
              {
                "title": @string@,
                "responses": {
                  "totalCount": @integer@
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": @integer@
                }
              },
              {
                "title": @string@,
                "responses": {
                  "totalCount": @integer@
                }
              }
            ]
          },
          {
            "type":"select",
            "otherResponses": {"totalCount": 0},
            "choices":[{"title":"React","responses":{"totalCount":0}},{"title":"Vue","responses":{"totalCount":0}}]
          }
        ]
      }
    }
  }
  """
