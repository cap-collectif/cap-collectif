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
                 "id":"UmVwbHk6cmVwbHky"
              },
              {
                 "id":"UmVwbHk6cmVwbHk1"
              },
              {
                 "id":"UmVwbHk6cmVwbHk5"
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
