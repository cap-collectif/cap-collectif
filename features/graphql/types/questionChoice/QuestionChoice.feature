@questionChoice
Feature: Question choice

Scenario: GraphQL client wants question's choices and the number of answers to each of them
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "questionnaire4") {
      ... on Questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
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
          {},
          {},
          {
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
              }
            ]
          },
          {
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
          }
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to see the ranking of the choices answered
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    questionnaire: node(id: "questionnaire4") {
      ... on Questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
            choices {
              title
              ranking {
                position
                responses {
                  totalCount
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

        },
        {

        },
        {
          "choices":[
            {
              "title": @string@,
              "ranking":@null@
            },
            {
              "title": @string@,
              "ranking":@null@
            }
          ]
        },
        {
          "choices":[
            {
              "title": @string@,
              "ranking":@null@
            },
            {
              "title": @string@,
              "ranking":@null@
            },
            {
              "title": @string@,
              "ranking":@null@
            }
          ]
        },
        {
          "choices":[
            {
              "title": @string@,
              "ranking":@null@
            },
            {
              "title": @string@,
              "ranking":@null@
            },
            {
              "title": @string@,
              "ranking":@null@
            }
          ]
        },
        {
          "choices":[
            {
              "title": @string@,
              "ranking":[
                @...@
              ]
            },
            {
              "title": @string@,
              "ranking":[
                 @...@
              ]
            },
            {
              "title": @string@,
              "ranking":[
                 @...@
              ]
            }
          ]
        }
      ]
    }
  }
}
  """
