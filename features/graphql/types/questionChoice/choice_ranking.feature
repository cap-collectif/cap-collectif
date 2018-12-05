@question_choice
Feature: Question choice ranking

Scenario: GraphQL client wants to see the ranking of the choices answered
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
    {
      questionnaire: node(id: "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNA==") {
        ... on Questionnaire {
          questions {
            ... on MultipleChoiceQuestion {
              choices(allowRandomize: false) {
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
                  {
                    "position": @integer@,
                    "responses": {
                      "totalCount": @integer@
                    }
                  },{
                    "position": @integer@,
                    "responses": {
                      "totalCount": @integer@
                    }
                  }
                ]
              },
              {
                "title": @string@,
                "ranking":[
                  {
                    "position": @integer@,
                    "responses": {
                      "totalCount": @integer@
                    }
                  }
                ]
              },
              {
                "title": @string@,
                "ranking":[
                  {
                    "position": @integer@,
                    "responses": {
                      "totalCount": @integer@
                    }
                  },{
                    "position": @integer@,
                    "responses": {
                      "totalCount": @integer@
                    }
                  }
                ]
              }
            ]
          },
          {"choices":[{"title":"React","ranking":null},{"title":"Vue","ranking":null}]}
        ]
      }
    }
  }
  """
