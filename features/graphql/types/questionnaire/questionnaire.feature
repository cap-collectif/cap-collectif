@questionnaire
Feature: Questionnaire

Scenario: GraphQL client wants to retrieve questions
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      questionnaire: node(id: "questionnaire1") {
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
      questionnaire: node(id: "questionnaire1") {
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
    "data": {
      "questionnaire": {
        "viewerReplies": [
          {
            "id": "reply2",
            "responses": [
                {
                  "question": {"id": "2"},
                  "value": "Youpi ! J\u0027adore des JO"
                },
                {
                  "question": {"id": "13"},
                  "value": "{\"labels\":[\"Natation\",\"Sports collectifs\"],\"other\":null}"
                },
                {
                  "question": {"id": "14"},
                  "value": "{\"labels\":[\"Maxime Arrouard\"],\"other\":null}"
                },
                {
                  "question": {"id": "15"},
                  "value": @null@
                },
                {
                  "question": {"id": "16"},
                  "value": "{\"labels\":[],\"other\":null}"
                },
                {
                  "question": {"id": "18"},
                  "value": "{\"labels\":[],\"other\":null}"
                },
                {
                  "question": {"id": "19"},
                  "value": "{\"labels\":[],\"other\":null}"
                },
                {
                  "question": {"id": "301"},
                  "value": @null@
                },
                {
                  "question": {"id": "302"},
                  "value": @null@
                }
            ]
          },
          {
            "id": "reply5",
            "responses": [
              {
                "question": {"id":"13"},
                "value":"{\"labels\":[\"Natation\"],\"other\":null}"
              },
              {
                "question": {"id":"2"},
                "value": @null@
              },
              {
                "question": {"id":"14"},
                "value":"{\"labels\":[],\"other\":null}"
              },
              {
                "question": {"id":"15"},
                "value": @null@
              },
              {
                "question": {"id":"16"},
                "value":"{\"labels\":[],\"other\":null}"
              },
              {
                "question": {"id":"18"},
                "value":"{\"labels\":[],\"other\":null}"
              },
              {
                "question": {"id":"19"},
                "value":"{\"labels\":[],\"other\":null}"
              },
              {
                "question": {"id":"301"},
                "value": @null@
              },
              {
                "question": {"id":"302"},
                "value": @null@
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
      questionnaire: node(id: "questionnaire4") {
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
