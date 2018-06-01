@addReply
Feature: Add Reply

@database
Scenario: User wants to add a reply
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddReplyInput!) {
      addReply(input: $input) {
        reply {
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
    }",
    "variables": {
      "input": {
        "questionnaireId": "questionnaire1",
        "responses": [
            {
              "question": "2",
              "value": "Je pense que c'est la ville parfaite pour organiser les JO"
            },
            {
              "question": "13",
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
      "addReply": {
          "reply": {
              "id": @uuid@,
              "responses": [
                  {"question":{"id":"2"},"value":"Je pense que c\u0027est la ville parfaite pour organiser les JO"},
                  {"question":{"id":"13"},"value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"},
                  {"question":{"id":"14"},"value":"\u0022{\\\u0022labels\\\u0022:[],\\\u0022other\\\u0022:null}\u0022"},
                  {"question":{"id":"15"},"value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"},
                  {"question":{"id":"16"},"value":"\u0022{\\\u0022labels\\\u0022:[],\\\u0022other\\\u0022:null}\u0022"},
                  {"question":{"id":"18"},"value":"\u0022{\\\u0022labels\\\u0022:[],\\\u0022other\\\u0022:null}\u0022"},
                  {"question":{"id":"19"},"value":"\u0022{\\\u0022labels\\\u0022:[],\\\u0022other\\\u0022:null}\u0022"}
              ]
          }
       }
     }
  }
  """
