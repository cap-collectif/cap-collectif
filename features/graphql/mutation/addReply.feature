@addReply @reply
Feature: Add Reply

@database
Scenario: User wants to add a reply
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddUserReplyInput!) {
      addUserReply(input: $input) {
        reply {
          id
          published
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
          }
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==",
        "draft": false,
        "responses": [
            {
              "question": "UXVlc3Rpb246Mg==",
              "value": "Je pense que c'est la ville parfaite pour organiser les JO"
            },
            {
              "question": "UXVlc3Rpb246MTM=",
              "value": "{\"labels\":[\"Athlétisme\",\"Sports collectifs\"],\"other\":\"Embêter Maxime\"}"
            }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addUserReply": {
          "reply": {
              "id": @string@,
              "published": true,
              "responses": [
                {"question": {"id":"UXVlc3Rpb246Mg=="}, "value": "Je pense que c\u0027est la ville parfaite pour organiser les JO"},
                {"question": {"id":"UXVlc3Rpb246MTM="}, "value": "{\"labels\":[\"Athl\u00e9tisme\",\"Sports collectifs\"],\"other\":\"Emb\u00eater Maxime\"}"},
                {"question": {"id":"UXVlc3Rpb246MTQ="}, "value": "{\"labels\":[],\"other\":null}"},
                {"question": {"id":"UXVlc3Rpb246MTU="}, "value": @null@ },
                {"question": {"id":"UXVlc3Rpb246MTY="}, "value": "{\"labels\":[],\"other\":null}"},
                {"question": {"id":"UXVlc3Rpb246MTg="}, "value": "{\"labels\":[],\"other\":null}"},
                {"question": {"id":"UXVlc3Rpb246MTk="}, "value": "{\"labels\":[],\"other\":null}"},
                {"question": {"id":"UXVlc3Rpb246MzAx"}, "value": @null@},
                {"question": {"id":"UXVlc3Rpb246MzAy"}, "value": @null@},
                {"question": {"id":"UXVlc3Rpb246MTM4NQ=="}, "value": @null@},
                {"question": {"id":"UXVlc3Rpb246Mzk0NA=="}, "value": "{\"labels\":[],\"other\":null}"}
              ]
          },
         "errorCode":null
       }
     }
  }
  """

@database
Scenario: User wants to add an answer without fulfilling the requirements
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddUserReplyInput!) {
      addUserReply(input: $input) {
        reply {
          id
          published
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
          }
        }
        questionnaire {
          id
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw==",
        "draft": false,
        "responses": [
            {
              "question": "UXVlc3Rpb246Mzk0NQ==",
              "value": "{\"labels\":[\"Nom\"]}"
            }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"addUserReply":{"reply":null,"questionnaire":{"id":"UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw=="},"errorCode":"REQUIREMENTS_NOT_MET"}}}
  """
