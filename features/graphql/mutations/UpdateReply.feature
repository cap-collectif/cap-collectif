@updateReply @reply
Feature: Update Reply

@database
Scenario: User wants to update a reply
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateReplyInput!) {
      updateReply(input: $input) {
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
      }
    }",
    "variables": {
      "input": {
        "replyId": "UmVwbHk6cmVwbHky",
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
   "data":{
      "updateReply":{
         "reply":{
            "id":"UmVwbHk6cmVwbHky",
            "published":true,
            "responses":[
               {
                  "question": {
                     "id": "UXVlc3Rpb246MTk="
                  },
                  "value": "{\u0022labels\u0022:[\u0022Il bluffe\u0022],\u0022other\u0022:null}"
               },
               {
                  "question": {
                     "id": "UXVlc3Rpb246MjA="
                  },
                  "value": "{\u0022labels\u0022:[\u0022Au top\u0022],\u0022other\u0022:null}"
               },
               {
                  "question": {
                     "id": "UXVlc3Rpb246MTg="
                  },
                  "value": "{\u0022labels\u0022:[\u0022Logo 1\u0022],\u0022other\u0022:null}"
               },
               {
                  "question": {
                     "id": "UXVlc3Rpb246MTU="
                  },
                  "value": "Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)"
               },
               {
                  "question": {
                     "id": "UXVlc3Rpb246MTM="
                  },
                  "value": "{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"UXVlc3Rpb246Mg=="
                  },
                  "value":"Je pense que c\u0027est la ville parfaite pour organiser les JO"
               },
               {
                  "question":{
                     "id":"UXVlc3Rpb246MTQ="
                  },
                  "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"UXVlc3Rpb246MTY="
                  },
                  "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"UXVlc3Rpb246MzAx"
                  },
                  "value":null
               },
               {
                  "question":{
                     "id":"UXVlc3Rpb246MzAy"
                  },
                  "value":null
               }
            ]
         }
      }
   }
}
  """
