@proposal @update_proposal
Feature: Update a proposal

@database @rabbitmq
Scenario: Admin should be notified if GraphQL user modify his proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "Achetez un DOP à la madeleine",
        "body": "Grâce à ça, on aura des cheveux qui sentent la madeleine !!!!!!!",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
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
      "changeProposalContent": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "title": "Achetez un DOP à la madeleine",
          "body": "Grâce à ça, on aura des cheveux qui sentent la madeleine !!!!!!!",
          "publicationStatus": "PUBLISHED"
        }
      }
    }
  }
  """
  Then the queue associated to "proposal_update" producer has messages below:
  | 0 | {"proposalId": "proposal2"} |

@database
Scenario: GraphQL client wants to edit his proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "Acheter un sauna par personne pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
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
      "changeProposalContent": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "title": "Acheter un sauna par personne pour Capco",
          "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit",
          "publicationStatus": "PUBLISHED"
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "New title",
        "body": "New body",
        "category": "pCategory3",
        "responses": [
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "New reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1", "media2"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          },
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "New reponse-1"
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
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwy",
              "title":"New title",
              "body":"New body",
              "publicationStatus":"PUBLISHED",
              "responses":[
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MzAz"
                    },
                    "value":null
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MQ=="
                    },
                    "value":"New reponse-1"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246Mw=="
                    },
                    "value":"New reponse-3"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTE="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       },
                       {
                          "id":"media2"
                       }
                    ]
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTI="
                    },
                    "medias":[

                    ]
                 }
              ]
           }
        }
     }
  }
  """

@database
Scenario: Super Admin GraphQL client wants to update a proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          author {
            _id
          }
          theme {
            id
          }
          district {
            id
          }
          category {
            id
          }
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyQWRtaW4=",
        "district": "district2",
        "category": "pCategory2",
        "responses": [
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media1"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwy",
              "title":"NewTitle",
              "body":"NewBody",
              "author":{
                 "_id":"userAdmin"
              },
              "theme":{
                 "id":"theme1"
              },
              "district":{
                 "id":"district2"
              },
              "category":{
                 "id":"pCategory2"
              },
              "responses":[
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MzAz"
                    },
                    "value":null
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MQ=="
                    },
                    "value":"reponse-1"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246Mw=="
                    },
                    "value":"reponse-3"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTE="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       }
                    ]
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTI="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       }
                    ]
                 }
              ]
           }
        }
     }
  }
  """

@database
Scenario: GraphQL client wants to edit his proposal without required response
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": []
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "errors":[{"message":"proposal.missing_required_responses {\"missing\":11}","@*@": "@*@"}],
  "data": { "changeProposalContent": null }
  }
  """

@database
Scenario: Admin GraphQL client wants to update a and published a draft proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          draft
          published
          publishedAt
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyQWRtaW4=",
        "district": "district3",
        "draft": false,
        "category": "pCategory2",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": ""
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media10"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media10"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWwyMQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwyMQ==",
              "title":"NewTitle",
              "body":"NewBody",
              "draft":false,
              "published":true,
              "publishedAt": "@string@.isDateTime()",
              "publicationStatus":"PUBLISHED"
           }
        }
     }
  }
  """

@database
Scenario: GraphQL client try to update a and published a draft proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          draft
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyX25vdF9jb25maXJtZWRfd2l0aF9jb250cmlidXRpb25z",
        "district": "district3",
        "draft": false,
        "category": "pCategory2",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": ""
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media10"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media10"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWxEcmFmdFdpdGhOb3RDb25maXJtZWRBdXRob3I="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
   "data":{
      "changeProposalContent":{
         "proposal":{
            "id":"UHJvcG9zYWw6cHJvcG9zYWxEcmFmdFdpdGhOb3RDb25maXJtZWRBdXRob3I=",
            "title":"NewTitle",
            "draft":false,
            "publicationStatus":"UNPUBLISHED"
         }
      }
   }
}
  """
