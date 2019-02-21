@updateReply
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
        "replyId": "reply2",
        "draft": false,
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
   "data":{
      "updateReply":{
         "reply":{
            "id":"reply2",
            "published":true,
            "responses":[
               {
                  "question":{
                     "id":"2"
                  },
                  "value":"Je pense que c\u0027est la ville parfaite pour organiser les JO"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"14"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Maxime Arrouard\u0022],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"13"
                  },
                  "value":"{\u0022labels\u0022:[\u0022Athl\u00e9tisme\u0022,\u0022Sports collectifs\u0022],\u0022other\u0022:\u0022Emb\u00eater Maxime\u0022}"
               },
               {
                  "question":{
                     "id":"15"
                  },
                  "value":null
               },
               {
                  "question":{
                     "id":"16"
                  },
                  "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"18"
                  },
                  "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"19"
                  },
                  "value":"{\u0022labels\u0022:[],\u0022other\u0022:null}"
               },
               {
                  "question":{
                     "id":"301"
                  },
                  "value":null
               },
               {
                  "question":{
                     "id":"302"
                  },
                  "value":null
               }
            ]
         }
      }
   }
}
  """
